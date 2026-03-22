import FreelancerList from "@/app/ui/dashboard-components/talent-posting/talentList";
import { Suspense } from "react";
import Loading from "../loading";



const page = ( ) => {
  return (
      <FreelancerList  savedFreelancers={true} />
  );
};

export default page;
