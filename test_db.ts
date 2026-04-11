import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env" });

interface JobDocument {
  _id: string;
  title: string;
  status: string;
  userId: string;
  [key: string]: unknown;
}

interface JobStatusCount {
  [key: string]: number;
}

const MONGODB_URI = process.env.MONGODB_URI;

async function run(): Promise<void> {
  if (!MONGODB_URI) {
    console.error("No MONGODB_URI found.");
    return;
  }

  await mongoose.connect(MONGODB_URI, { dbName: "weddly" });
  console.log("Connected to MongoDB:", MONGODB_URI.slice(0, 20) + "...");

  const db = mongoose.connection.useDb("weddly");
  const jobsCollection = db.collection<JobDocument>("jobs");

  const jobs = await jobsCollection.find({}).toArray();
  console.log(`Found ${jobs.length} total jobs.`);

  const myUserId = "some_freelancer_id"; // Not strictly needed
  const activeJobs = jobs.filter((j) => j.status === "active");
  console.log(`Found ${activeJobs.length} active jobs.`);

  if (jobs.length > 0) {
    const statuses: JobStatusCount = {};
    jobs.forEach((j) => {
      statuses[j.status] = (statuses[j.status] || 0) + 1;
    });
    console.log("Job status counts:", statuses);
    console.log(
      "First 2 jobs:",
      jobs
        .slice(0, 2)
        .map((j) => ({ title: j.title, status: j.status, userId: j.userId }))
    );
  }

  await mongoose.disconnect();
}

run().catch(console.error);
