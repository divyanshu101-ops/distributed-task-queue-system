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

export const incrementAttempts = async (jobId) => {
    const result = await pool.query(
        `
        UPDATE jobs
        SET attempts = attempts + 1,
            updated_at = NOW()
        WHERE id = $1
        RETURNING attempts;
        `,
        [jobId]
    );

    return result.rows[0].attempts;
};

export const getJobById = async (jobId) => {

    const result = await pool.query(
        `
        SELECT *
        FROM jobs
        WHERE id = $1;
        `,
        [jobId]
    );

    return result.rows[0];
};