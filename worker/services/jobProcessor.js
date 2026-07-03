import { updateJobStatus, incrementAttempts } from "./jobService.js";
import dotenv from "dotenv";

dotenv.config();
const MAX_RETRIES = Number(process.env.MAX_RETRIES);

export const processJob = async (job) => {

    // Increment retry count
    const attempts = await incrementAttempts(job.id);
    console.log(`Attempt Number: ${attempts}`);

    // Stop processing if retry limit is reached
    if (attempts > MAX_RETRIES) {
        throw new Error("Maximum retry limit reached");
    }

    console.log(`Processing Job ${job.id}`);

    // Update status
    await updateJobStatus(job.id, "processing");

    console.log("Status Updated -> processing");

    // --------- Business Logic ------------

    // Simulate long-running task
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Simulate failure
    // throw new Error("Email service failed");

    console.log("Email Sent Successfully");

    process.exit(1);
    
    await updateJobStatus(job.id, "completed");

    console.log("Status Updated -> completed");
};