import test from "node:test";
import assert from "node:assert/strict";
import { applyServerFilters, paginateItems } from "../app/lib/jobFilters";

const sampleJobs = [
  {
    jobId: "1",
    title: "Lead Wedding Photographer",
    description: "Need moody candid photo coverage",
    fullName: "Sarah Johnson",
    type: "Reception",
    location: "Chicago, IL",
    tags: ["Photography", "Candid"],
    experience: "Expert",
    budget: "$800 - $1200",
    eventDate: "2026-07-15T00:00:00.000Z",
    createdAt: "2026-04-02T08:00:00.000Z",
  },
  {
    jobId: "2",
    title: "Pre-Wedding Videographer",
    description: "Drone and cinematic highlights",
    fullName: "Ethan Lee",
    type: "Pre-Wedding",
    location: "Evanston, IL",
    tags: ["Videography", "Drone"],
    experience: "Intermediate",
    budget: "$450 Fixed",
    eventDate: "2026-07-16T00:00:00.000Z",
    createdAt: "2026-04-01T08:00:00.000Z",
  },
  {
    jobId: "3",
    title: "Wedding Day Live Band",
    description: "Acoustic set for ceremony and cocktail hour",
    fullName: "Emily Carter",
    type: "Wedding Day (Janti & Bibaha)",
    location: "Naperville, IL",
    tags: ["Music", "LiveBand"],
    experience: "Entry",
    budget: "$300 - $500",
    eventDate: "2026-07-15T00:00:00.000Z",
    createdAt: "2026-03-30T08:00:00.000Z",
  },
];

test("applyServerFilters handles combined search, category, experience, budget, date and sorting", () => {
  const filtered = applyServerFilters(sampleJobs, {
    search: "wedding",
    location: "IL",
    category: "Reception",
    experiences: ["Expert"],
    minBudget: 700,
    maxBudget: 1300,
    eventDate: "2026-07-15",
    sortBy: "budget",
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].jobId, "1");
});

test("applyServerFilters sorts by newest when sortBy is newest", () => {
  const filtered = applyServerFilters(sampleJobs, {
    search: null,
    location: null,
    category: "All Categories",
    experiences: [],
    minBudget: null,
    maxBudget: null,
    eventDate: null,
    sortBy: "newest",
  });

  assert.deepEqual(
    filtered.map((job) => job.jobId),
    ["1", "2", "3"]
  );
});

test("paginateItems slices collection and reports hasMore", () => {
  const page1 = paginateItems(sampleJobs, 1, 2);
  assert.equal(page1.items.length, 2);
  assert.equal(page1.pagination.total, 3);
  assert.equal(page1.pagination.pages, 2);
  assert.equal(page1.pagination.hasMore, true);

  const page2 = paginateItems(sampleJobs, 2, 2);
  assert.equal(page2.items.length, 1);
  assert.equal(page2.pagination.hasMore, false);
});
