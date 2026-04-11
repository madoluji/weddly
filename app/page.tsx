import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const roles = session?.user?.roles;

  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  if (roles?.freelancer) {
    redirect("/user/best-matches");
  }

  if (roles?.client) {
    redirect("/client/best-matches");
  }

  if (roles?.venue) {
    redirect("/venue");
  }

  redirect("/signup/usermode-select");
}
