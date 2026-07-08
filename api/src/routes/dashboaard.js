import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM jobs
            ORDER BY created_at DESC;
        `);

        const stats = {
            totalJobs: result.rows.length,
            pending: 0,
            processing: 0,
            completed: 0,
            retrying: 0,
            deadLettered: 0
        };

        for (const job of result.rows) {

            switch (job.status) {

                case "pending":
                    stats.pending++;
                    break;

                case "processing":
                    stats.processing++;
                    break;

                case "completed":
                    stats.completed++;
                    break;

                case "retrying":
                    stats.retrying++;
                    break;

                case "dead_lettered":
                    stats.deadLettered++;
                    break;

            }

        }
        
        res.render("dashboard", {
            stats,
            recentJobs: result.rows.slice(0, 5)
        });

    } catch (error) {

        console.error(error);

        res.status(500).send("Internal Server Error");

    }

});

export default router;