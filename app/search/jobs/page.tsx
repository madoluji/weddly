import FindJobBoard from "@/app/ui/dashboard-components/job-list/findJobBoard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user";
import { redirect } from "next/navigation";
import { toInitialFindJobFilters } from "@/app/lib/findJobFlow";

interface searchParams {
  search?: string;
  title?: string;
  location?: string;
  category?: string;
  experience?: string;
  minBudget?: string;
  maxBudget?: string;
  eventDate?: string;
  sortBy?: string;
}

// Defining the interface for component props
interface Props {
  searchParams?: Promise<searchParams> | undefined;
}

const page = async ({ searchParams }: Props) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fsearch%2Fjobs");
  }

  await connectMongoDB();
  const currentUser = await User.findById(session.user.id).select("roles.freelancer");

  if (!currentUser?.roles?.freelancer) {
    redirect("/client/best-matches");
  }

  const resolvedSearchParams = await searchParams;
  return (
    <FindJobBoard
      initialFilters={toInitialFindJobFilters(resolvedSearchParams)}
    />
  );
};

export default page;
