import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFindJobQueryParams,
  getApplyAction,
  toInitialFindJobFilters,
} from "../app/lib/findJobFlow";
import { applyServerFilters } from "../app/lib/jobFilters";

const sampleJobs = [
  {
    jobId: "a1",
    title: "Reception Photographer",
    description: "Need candid reception coverage",
    fullName: "Client One",
    type: "Reception",
    location: "Chicago, IL",
    tags: ["Photography", "Candid"],
    experience: "Expert",
    budget: "$1000 - $1500",
    eventDate: "2026-09-12T00:00:00.000Z",
    createdAt: "2026-04-03T09:00:00.000Z",
    status: "active",
    hasApplied: true,
  },
  {
    jobId: "a2",
    title: "Haldi DJ",
    description: "Traditional and modern mix",
    fullName: "Client Two",
    type: "Haldi",
    location: "Kathmandu",
    tags: ["Music"],
    experience: "Intermediate",
    budget: "$300 - $500",
    eventDate: "2026-09-13T00:00:00.000Z",
    createdAt: "2026-04-02T09:00:00.000Z",
    status: "active",
    hasApplied: false,
  },
];

test("search-filter-apply flow keeps URL/state/data/action aligned", () => {
  const initial = toInitialFindJobFilters({
    search: "photographer",
    location: "chicago",
    category: "Reception",
    minBudget: "900",
    maxBudget: "1600",
    eventDate: "2026-09-12",
    sortBy: "budget",
  });

  const params = buildFindJobQueryParams(initial);

  assert.equal(params.get("search"), "photographer");
  assert.equal(params.get("location"), "chicago");
  assert.equal(params.get("category"), "Reception");
  assert.equal(params.get("minBudget"), "900");
  assert.equal(params.get("maxBudget"), "1600");
  assert.equal(params.get("eventDate"), "2026-09-12");
  assert.equal(params.get("sortBy"), "budget");

  const filtered = applyServerFilters(sampleJobs, {
    search: initial.search,
    location: initial.location,
    category: initial.category,
    minBudget: Number(initial.minBudget),
    maxBudget: Number(initial.maxBudget),
    eventDate: initial.eventDate,
    sortBy: initial.sortBy,
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].jobId, "a1");

  const action = getApplyAction({
    jobStatus: filtered[0].status,
    hasApplied: filtered[0].hasApplied,
    jobId: filtered[0].jobId,
  });

  assert.equal(action.label, "Applied");
  assert.equal(action.disabled, true);
  assert.equal(action.href, "/user/proposal/a1");
});
