import FreelancerList from "@/app/ui/dashboard-components/talent-posting/talentList";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";
const Page = () => {
  return (
    <PageShell
      title="Saved Talents"
      description="Review freelancers you bookmarked for your upcoming projects"
    >
      <PageCard>
        <FreelancerList savedFreelancers={true} />
      </PageCard>
    </PageShell>
  );
};

export default Page;
