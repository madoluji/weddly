import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectMongoDB } from "@/app/lib/mongodb";
import Contract from "@/models/contract";

const Page = async ({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) => {
  const { contractId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectMongoDB();
  const contract = await Contract.findById(contractId)
    .select("jobId clientId freelancerId")
    .lean();

  if (!contract?.jobId) {
    redirect("/user/your-contracts");
  }

  const isClient = contract.clientId?.toString() === session.user.id;
  const basePath = isClient ? "/client/your-contracts" : "/user/your-contracts";

  redirect(`${basePath}/${contractId}/${contract.jobId.toString()}`);
};

export default Page;
