import pool from "../config/db.js";

export const updateJobStatus = async (jobId, status) => {
    const result = await pool.query(
        `
        UPDATE jobs
        SET status = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING *;
        `,
        [status, jobId]
    );

    return result.rows[0];
};