import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import { NextRequest } from "next/server";
import Jobs from "@/models/jobs";
import Proposal from "@/models/proposal";
import SavedJobs from "@/models/savedJobs";
import Contract from "@/models/contract";
import Payment from "@/models/payment";
import ProjectDetails from "@/models/projectDetails";

interface RequestBody {
  userId: string;
  fullName: string;
  title: string;
  type: string;
  experience: string;
  budget: string;
  description: string;
  tags: string[];
  location: string;
  fileUrls: string[];

}

export async function POST(req: NextRequest) {
  const status = "active";
  try {

    const userData = req.headers.get("user");
    const user = userData ? JSON.parse(userData) : null;
    // if (!user.emailVerified) {


    //   return NextResponse.json({ message: `Unauthorized email not verified` }, { status: 400 });
    // }
    const fullName = user.name + " " + user.lastName;
    const userId = user.id;
    const {
      title,
      type,
      experience,
      budget,
      description,
      tags,
      location,
      fileUrls,
    }: RequestBody = await req.json();

    await connectMongoDB();
    // Save the data in the database
    await Jobs.create({
      userId,
      fullName,
      title,
      type,
      experience,
      budget,
      description,
      tags,
      location,
      fileUrls,
      status,


    });
    const responseData = {
      userId,
      fullName,
      title,
      type,
      experience,
      budget,
      description,
      tags,
      location,
      fileUrls,
    };

    return NextResponse.json(
      { message: "Data Received Successfully", data: responseData },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userData = req.headers.get("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ message: "jobId is required" }, { status: 400 });
    }

    await connectMongoDB();

    const job = await Jobs.findById(jobId);
    if (!job) {
      return NextResponse.json({ message: "Gig not found" }, { status: 404 });
    }

    if (job.userId.toString() !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const [hasContract, hasPayment, hasProjectDetails] = await Promise.all([
      Contract.exists({ jobId }),
      Payment.exists({ jobId }),
      ProjectDetails.exists({ jobId }),
    ]);

    if (hasContract || hasPayment || hasProjectDetails) {
      return NextResponse.json(
        {
          message:
            "This gig is linked to active work records and cannot be deleted.",
        },
        { status: 409 }
      );
    }

    await Promise.all([
      Proposal.deleteMany({ jobId }),
      SavedJobs.deleteMany({ jobId }),
      Jobs.findByIdAndDelete(jobId),
    ]);

    return NextResponse.json(
      { message: "Gig deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting gig:", error);
    return NextResponse.json(
      { message: "Error deleting gig" },
      { status: 500 }
    );
  }
}
