import SettingsPage from "@/app/ui/user-component/usersettings";
import React, { Suspense } from "react";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

export default function ClientSettingsPage() {
  return (
    <PageShell
      title="Client Settings"
      description="Manage your client account preferences and wedding details"
    >
      <PageCard>
        <Suspense fallback={<div>Loading...</div>}>
          <SettingsPage mode="client" />
        </Suspense>
      </PageCard>
    </PageShell>
  );
}
