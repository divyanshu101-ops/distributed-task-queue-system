import express from "express";
import pool from "../config/db.js";
import { publishJob}  from "../config/rabbitmq.js";

const router = express.Router();

router.post("/", async (req, res) => {
    console.log("Route Hit");
    console.log(req.body);
    try {
        const { type, payload } = req.body;

        if (!type || !payload) {
            return res.status(400).json({
                success: false,
                message: "type and payload are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO jobs(type, payload)
            VALUES ($1, $2)
            RETURNING *;
            `,
            [type, payload]
        );

        const job = {
            id: result.rows[0].id,
            type: result.rows[0].type,
            payload: result.rows[0].payload, 
        };

        await publishJob(job);

        return res.status(201).json({
            success: true,
            job: result.rows[0]
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM jobs
            ORDER BY created_at DESC;
        `);

        return res.status(200).json({
            success: true,
            jobs: result.rows
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});

router.get("/:id", async (req, res)=>{
    try {
        const id = req.params.id;


        const result = await pool.query(`
            SELECT * FROM jobs
            WHERE id = $1;
            `, [id]);

        if(result.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }
            
        return res.status(200).json({
            success: true,
            job: result.rows[0]
        })    
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
})

router.post("/:id/retry", async (req, res) => {
    try {
        const id = req.params.id;

        const result = await pool.query(`
            SELECT * FROM jobs
            WHERE id = $1; 
            `, [id])
        
        if(result.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        if(result.rows[0].status !== "dead_lettered"){
            return res.status(400).json({
                success: false,
                message: "Only dead_lettered jobs can be retried."
            });
        };

        const jobMessage = {
            id: result.rows[0].id,
            type: result.rows[0].type,
            payload: result.rows[0].payload,
        };

        await publishJob(jobMessage);

        const update_db = await pool.query(`
            UPDATE jobs
            SET attempts = 0,
                status = 'pending',
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            `, [id]
        );

        return res.status(200).json({
            success: true,
            message: "Job republished successfully.",
            data: update_db.rows[0]
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
});
export default router;