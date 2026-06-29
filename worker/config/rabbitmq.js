import amqp from "amqplib";
import dotenv from "dotenv";
import { processJob } from "../services/jobProcessor.js";
import { updateJobStatus, getJobById } from "../services/jobService.js";

dotenv.config();
 
const MAX_RETRIES = Number(process.env.MAX_RETRIES);

let connection;
let channel;

export const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        console.log("RabbitMQ Connected");

        channel = await connection.createChannel();
        console.log("Channel Created");

        await channel.assertQueue(process.env.QUEUE_NAME);

        await channel.assertQueue(process.env.RETRY_QUEUE);

        await channel.assertQueue(process.env.DLQ_NAME);

        console.log(`Queues "${process.env.QUEUE_NAME}, ${process.env.DLQ_NAME}, ${process.env.RETRY_QUEUE}" Ready`);

        await channel.prefetch(1);
        console.log("Prefetch Count = 1");
    } catch (error) {
        console.error("RabbitMQ Error:", error.message);
        process.exit(1);
    }
};

export const consumeJobs = async () => {
    console.log("Waiting for jobs...");

    channel.consume(process.env.QUEUE_NAME, async (msg) => {

        if (!msg) return;
        
        let job;

        try {

            job = JSON.parse(msg.content.toString());

            console.log();
            console.log("Job Received:");
            console.log(job);

            await processJob(job);

            // Tell RabbitMQ that job is processed successfully
            channel.ack(msg);

            console.log("ACK Sent");

        } catch (error) {
            console.error("Error Processing Job: ", error.message);

            if(job){
                await updateJobStatus(job.id, "failed");
            }

            const dbJob = await getJobById(job.id);

            if(dbJob.attempts < MAX_RETRIES){
                console.log("Retrying Job...");

                channel.nack(msg, false, true);
            }else{
                console.log("Maximum Retry Reached");

                channel.nack(msg, false, false);
            }
        }

    });
};