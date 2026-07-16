import express from "express";
import pool from "../config/db.js";
import { publishJob}  from "../config/rabbitmq.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {

    try {

        const { type } = req.body;

        let payload = {};

        switch (type) {

            case "email":

                payload = {
                    to: req.body.to,
                    subject: req.body.subject,
                    message: req.body.message
                };

                break;

            case "report":

                payload = {
                    reportName: req.body.reportName,
                    content: req.body.content
                };

                break;

            case "notification":

                payload = {
                    title: req.body.title,
                    userId: req.body.userId,
                    message: req.body.message
                };

                break;

            case "image":

                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: "Image is required."
                    });
                }

                payload = {
                    imageName: req.file.filename
                };

                break;

            case "file":

                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: "File is required."
                    });
                }

                payload = {
                    fileName: req.file.filename
                };

                break;

            default:

                return res.status(400).json({
                    success: false,
                    message: "Invalid Job Type"
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
            payload: result.rows[0].payload
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

router.get("/create", (req, res) => {
    res.render("createJob");
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