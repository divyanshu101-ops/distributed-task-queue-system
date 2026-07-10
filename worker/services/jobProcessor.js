import { updateJobStatus, incrementAttempts } from "./jobService.js";
import { processEmail } from "../processors/emailProcessor.js";
import { processReport } from "../processors/reportProcessor.js";

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

    switch (job.type) {
        case "email" : 
            await processEmail(job.payload);
            break;

        case "report" :
            await processReport(job.payload);
            break;
        default:
            console.log(`Unknown Job Type: ${job.type}`);
            throw new Error(`Unsupported job type: ${job.type}`); 
    }

    await updateJobStatus(job.id, "completed");

    console.log("Status Updated -> completed");
};