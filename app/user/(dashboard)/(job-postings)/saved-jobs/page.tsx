
import JobList from "@/app/ui/dashboard-components/job-list/jobList";
import PostingSkeleton from "@/app/ui/dashboard-components/skeletons/postingSkeleton";
import { Suspense } from "react";

// Defining the interface for search parameters

// Defining the interface for component props


// Main page component
const page = ( ) => {
  // Extracting the query parameter from searchParams
;

  return (
    // Wrapping JobList component with Suspense to show a fallback while loading
      <JobList savedJobs={true} />
  
  );
};

// Exporting the page component as the default export
export default page;
