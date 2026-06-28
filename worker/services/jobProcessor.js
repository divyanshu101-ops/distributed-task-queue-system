import { updateJobStatus } from "./jobService.js";

export const processJob = async (job) => {

    console.log(`Processing Job ${job.id}`);

    // Update status → processing
    await updateJobStatus(job.id, "processing");
    console.log("Status Updated -> processing");

    // Fake work
    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    throw new Error("Email service failed");
     
    console.log("Job Execution Completed");

    // Update status → completed
    await updateJobStatus(job.id, "completed");
    console.log("Status Updated");
};