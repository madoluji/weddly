import FreelancerList from "@/app/ui/dashboard-components/talent-posting/talentList";
import { Suspense } from "react";
import Loading from "../loading";

export default function Page() {
  return (
      <FreelancerList bestMatches={true} />
  );
}
