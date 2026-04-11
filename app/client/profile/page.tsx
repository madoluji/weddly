"use client";

import DisplayProfile from "@/app/ui/client-components/clientProfile";
import React from "react";
import PageShell from "@/app/ui/layout/PageShell";

const Profile: React.FC = () => {
    return (
        <PageShell
            title="Client Profile"
            description="View and manage your personal and client profile details"
        >
            <DisplayProfile />
        </PageShell>
    );
};

export default Profile;