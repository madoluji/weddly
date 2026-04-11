import FindJobBoard from "@/app/ui/dashboard-components/job-list/findJobBoard";
import { toInitialFindJobFilters } from "@/app/lib/findJobFlow";

interface SearchParams {
  search?: string;
  title?: string;
  location?: string;
  category?: string;
  minBudget?: string;
  maxBudget?: string;
  eventDate?: string;
  sortBy?: string;
}

interface Props {
  searchParams?: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props) => {
  const resolved = await searchParams;
  return <FindJobBoard initialFilters={toInitialFindJobFilters(resolved)} />;
};

export default Page;
