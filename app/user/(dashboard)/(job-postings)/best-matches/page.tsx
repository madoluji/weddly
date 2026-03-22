// Importing necessary components and hooks
import JobList from "@/app/ui/dashboard-components/job-list/jobList";
import PostingSkeleton from "@/app/ui/dashboard-components/skeletons/postingSkeleton";
import { Suspense } from "react";

// Main page component
const page = () => {
  return (
    // Wrapping JobList component with Suspense to show a fallback while loading
      <JobList bestMatches={true} />
  );
};

// Exporting the page component as the default export
export default page;

