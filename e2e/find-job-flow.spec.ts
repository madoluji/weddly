import { expect, test } from "@playwright/test";
import { applyServerFilters, paginateItems } from "../app/lib/jobFilters";

const fixtureJobs = [
  {
    jobId: "job-1",
    title: "Reception Photographer",
    type: "Reception",
    experience: "Expert",
    budget: "$1200 - $1800",
    description: "Need candid and editorial wedding reception coverage.",
    tags: ["Photography", "Candid"],
    location: "Chicago, IL",
    saved: false,
    createdAt: "2026-04-04T10:00:00.000Z",
    fullName: "Mia Carter",
    status: "active",
    eventDate: "2026-09-15T00:00:00.000Z",
    hasApplied: true,
    myProposalStatus: "pending",
  },
  {
    jobId: "job-2",
    title: "Haldi Photographer",
    type: "Haldi",
    experience: "Intermediate",
    budget: "$700 - $1000",
    description: "Photo and highlight coverage for Haldi event.",
    tags: ["Photography"],
    location: "Chicago, IL",
    saved: false,
    createdAt: "2026-04-03T10:00:00.000Z",
    fullName: "Aria Patel",
    status: "active",
    eventDate: "2026-09-15T00:00:00.000Z",
    hasApplied: false,
    myProposalStatus: null,
  },
  {
    jobId: "job-3",
    title: "Mehendi Makeup Artist",
    type: "Mehendi",
    experience: "Expert",
    budget: "$500 - $800",
    description: "Bridal and family makeup for mehendi.",
    tags: ["Makeup"],
    location: "Kathmandu",
    saved: false,
    createdAt: "2026-04-02T10:00:00.000Z",
    fullName: "Noah Sharma",
    status: "active",
    eventDate: "2026-09-16T00:00:00.000Z",
    hasApplied: false,
    myProposalStatus: null,
  },
  {
    jobId: "job-4",
    title: "Wedding Day Live Band",
    type: "Wedding Day (Janti & Bibaha)",
    experience: "Entry",
    budget: "$300 - $500",
    description: "Live acoustic set for ceremony and cocktail hour.",
    tags: ["Music"],
    location: "Evanston, IL",
    saved: false,
    createdAt: "2026-04-01T10:00:00.000Z",
    fullName: "Liam Stone",
    status: "active",
    eventDate: "2026-09-17T00:00:00.000Z",
    hasApplied: false,
    myProposalStatus: null,
  },
  {
    jobId: "job-5",
    title: "Pre-Wedding Videographer",
    type: "Pre-Wedding",
    experience: "Intermediate",
    budget: "$900 - $1300",
    description: "Drone cinematic pre-wedding sequence.",
    tags: ["Videography", "Drone"],
    location: "Naperville, IL",
    saved: false,
    createdAt: "2026-03-31T10:00:00.000Z",
    fullName: "Sophia Miles",
    status: "active",
    eventDate: "2026-09-18T00:00:00.000Z",
    hasApplied: false,
    myProposalStatus: null,
  },
  {
    jobId: "job-6",
    title: "Sangeet DJ",
    type: "Sangeet",
    experience: "Intermediate",
    budget: "$400 - $700",
    description: "Modern + traditional dance floor set.",
    tags: ["DJ"],
    location: "Chicago, IL",
    saved: false,
    createdAt: "2026-03-30T10:00:00.000Z",
    fullName: "Elena Roy",
    status: "active",
    eventDate: "2026-09-18T00:00:00.000Z",
    hasApplied: false,
    myProposalStatus: null,
  },
  {
    jobId: "job-7",
    title: "Reception Florist",
    type: "Reception",
    experience: "Expert",
    budget: "$1000 - $1600",
    description: "Luxury floral design and installation.",
    tags: ["Floral"],
    location: "Chicago, IL",
    saved: false,
    createdAt: "2026-03-29T10:00:00.000Z",
    fullName: "Ivy Chen",
    status: "active",
    eventDate: "2026-09-15T00:00:00.000Z",
    hasApplied: false,
    myProposalStatus: null,
  },
];

const toNumber = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

test("search filter apply flow with URL sync and server pagination", async ({ page }) => {
  await page.route("**/api/fetchJobs**", async (route) => {
    const url = new URL(route.request().url());

    const filtered = applyServerFilters(fixtureJobs, {
      search: url.searchParams.get("search"),
      location: url.searchParams.get("location"),
      category: url.searchParams.get("category"),
      experiences: (url.searchParams.get("experience") || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0),
      minBudget: toNumber(url.searchParams.get("minBudget")),
      maxBudget: toNumber(url.searchParams.get("maxBudget")),
      eventDate: url.searchParams.get("eventDate"),
      sortBy: url.searchParams.get("sortBy"),
    });

    const pageNumber = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "6");
    const paginated = paginateItems(filtered, pageNumber, limit);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        jobs: paginated.items,
        pagination: paginated.pagination,
      }),
    });
  });

  await page.goto("/e2e/find-job");

  await expect(
    page.getByRole("heading", { name: "Find your perfect wedding gig" })
  ).toBeVisible();

  await expect(page.getByRole("heading", { name: "7 Jobs found" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Load More Jobs" })).toBeVisible();

  await page.getByPlaceholder("Job title, keyword, or skill").fill("photographer");
  await expect(page).toHaveURL(/search=photographer/);
  await expect(page.getByRole("heading", { name: "2 Jobs found" })).toBeVisible();

  await page.getByLabel("Reception").check();
  await expect(page).toHaveURL(/category=Reception/);

  await page.locator('input[type="date"]').fill("2026-09-15");
  await expect(page).toHaveURL(/eventDate=2026-09-15/);

  await expect(page.locator("article")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Applied" })).toBeVisible();
  await expect(page.getByText("Status: pending")).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("heading", { name: "7 Jobs found" })).toBeVisible();

  await page.getByRole("button", { name: "Load More Jobs" }).click();
  await expect(page.locator("article")).toHaveCount(7);

  await expect(page.getByRole("link", { name: "Apply" }).first()).toHaveAttribute(
    "href",
    /\/user\/proposal\//
  );
});
