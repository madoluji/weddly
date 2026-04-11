import FreelancerList from "@/app/ui/dashboard-components/talent-posting/talentList";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

export default function Page() {
  return (
    <PageShell
      title="Best Matches"
      description="Discover freelancers who best match your posted job requirements"
    >
      <PageCard>
        <FreelancerList bestMatches={true} />
      </PageCard>
    </PageShell>
  );
}
