import { authOptions } from "@/app/lib/auth";
import ModeSelect from "@/app/ui/login-signup-component/modeSelect";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

const ResumeImportPage = async () => {
  const session = await getServerSession(authOptions); //typescript error
  const mode = null;
  // if (session?.mode) redirect("/");
  if (mode === "client") {
    redirect("/client/bestmatches");
  } else if (mode === "freelancer") {
    redirect("/");
  }

  return (
    <>
      <ModeSelect />
    </>
  );
};

export default ResumeImportPage;
