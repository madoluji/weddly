"use client";

import { Button } from "../../../../ui/button";
import AllJobsList from "@/app/ui/client-components/all-jobs/clientJobList";
import { useAuth } from "@/app/providers";

const YourJobsPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  return (
    <>
      <div className="mx-auto text-center">
        
      
        {id ? <AllJobsList userId={id} /> : <p>Loading...</p>}
      </div>
     
    </>
  );
};

export default YourJobsPage;
