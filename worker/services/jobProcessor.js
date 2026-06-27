import pool from "../config/db.js";

export const processJob = async (job) => {

    console.log(`🚀 Processing Job ${job.id}`);

    // 1. Update status -> processing
    await pool.query(
        `
        UPDATE jobs
        SET status = 'processing',
            updated_at = NOW()
        WHERE id = $1;
        `,
        [job.id]
    );

    console.log(" Status Updated -> processing");

    // 2. Fake execution (abhi sirf demo)
    console.log("Started:", new Date().toLocaleTimeString());

    await new Promise(resolve => setTimeout(resolve, 50000));

    console.log("Finished:", new Date().toLocaleTimeString());
    

    // 3. Update status -> completed
    await pool.query(
        `
        UPDATE jobs
        SET status = 'completed',
            updated_at = NOW()
        WHERE id = $1;
        `,
        [job.id]
    );

    console.log("Status Updated -> completed");

};