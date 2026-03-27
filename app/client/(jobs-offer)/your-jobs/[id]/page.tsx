"use client";

import { use } from "react";
import { Button } from "../../../../ui/button";
import AllJobsList from "@/app/ui/client-components/all-jobs/clientJobList";
import { useAuth } from "@/app/providers";

const YourJobsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  return (
    <>
      <div className="mx-auto text-center">
        
      
        {id ? <AllJobsList userId={id} /> : <p>Loading...</p>}
      </div>
     
    </>
  );
};

export default YourJobsPage;
