require('dotenv').config({ path: '.env' });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  if (!MONGODB_URI) { console.error("No MONGODB_URI found."); return; }
  await mongoose.connect(MONGODB_URI, { dbName: "weddly" });
  console.log("Connected to MongoDB:", MONGODB_URI.slice(0, 20) + "...");
  
  const db = mongoose.connection.useDb("weddly");
  const jobsCollection = db.collection("jobs");
  
  const jobs = await jobsCollection.find({}).toArray();
  console.log(`Found ${jobs.length} total jobs.`);
  
  const myUserId = "some_freelancer_id"; // Not strictly needed
  const activeJobs = jobs.filter(j => j.status === 'active');
  console.log(`Found ${activeJobs.length} active jobs.`);
  
  if (jobs.length > 0) {
    const statuses = {};
    jobs.forEach(j => {
      statuses[j.status] = (statuses[j.status] || 0) + 1;
    });
    console.log("Job status counts:", statuses);
    console.log("First 2 jobs:", jobs.slice(0, 2).map(j => ({ title: j.title, status: j.status, userId: j.userId })));
  }
  
  await mongoose.disconnect();
}

run().catch(console.dir);
