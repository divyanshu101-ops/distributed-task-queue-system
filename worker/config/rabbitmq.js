import amqp from "amqplib";
import dotenv from "dotenv";
import { processJob } from "../services/jobProcessor.js";
import { updateJobStatus, getJobById } from "../services/jobService.js";
import { setupRabbitMQ } from "../rabbitmq/setupRabbitMQ.js";
import { getRedisClient } from "./redis.js";

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
        console.log();

        await setupRabbitMQ(channel);

        await channel.prefetch(1);
        console.log("Prefetch Count = 1");
        console.log();
    } catch (error) {
        console.error("RabbitMQ Error:", error.message);
        process.exit(1);
    }
};

export const publishRetryJob = async (job) => {

    if (!channel) {
        throw new Error("RabbitMQ channel is not initialized");
    }

    const published = channel.publish(
        process.env.RETRY_EXCHANGE,
        process.env.RETRY_ROUTING_KEY,
        Buffer.from(JSON.stringify(job)),
        {
            persistent: true,
        }
    );

    if (!published) {
        throw new Error("Failed to publish retry job");
    }

    console.log("Job Published To Retry Queue");
};

export const publishToDLQ = async (job) => {

    if (!channel) {
        throw new Error("RabbitMQ channel is not initialized");
    }

    const published = channel.publish(
        process.env.DLX_EXCHANGE,
        process.env.DLQ_ROUTING_KEY,
        Buffer.from(JSON.stringify(job)),
        {
            persistent: true,
        }
    );

    if (!published) {
        throw new Error("Failed to publish DLQ job");
    }

    console.log("Job Published To Dead Letter Queue");
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

            const redisClient = getRedisClient();

            const redisKey = `job:${job.id}`;

            const isProcessed = await redisClient.exists(redisKey);

            if(isProcessed){
                console.log(`job ${job.id} already processed. Skipping...`);

                channel.ack(msg);

                console.log("Ack Sent");

                return;
            }

            await processJob(job);


            await redisClient.set(
                redisKey, 
                "processed", 
                {
                    EX:86400
                }
            );

            console.log(`Redis Key Stored: ${redisKey}`);

            channel.ack(msg);
            console.log("ACK Sent");

        } catch (error) {

            console.error("Error Processing Job:", error.message);

            if (!job) {
                console.error("Invalid Job Message");
                channel.nack(msg, false, false);
                return;
            }

            const dbJob = await getJobById(job.id);

            if (!dbJob) {
                throw new Error(`Job ${job.id} not found`);
            }

            try {

                if (dbJob.attempts < MAX_RETRIES) {

                    console.log("Publishing Job To Retry Queue...");

                    await publishRetryJob(job);

                    await updateJobStatus(job.id, "retrying");
                    console.log("Status Updated -> retrying");

                } else {

                    console.log("Publishing Job To Dead Letter Queue...");

                    await publishToDLQ(job);

                    await updateJobStatus(job.id, "dead_lettered");
                    console.log("Status Updated -> dead_lettered");
                }

                channel.ack(msg);
                console.log("ACK Sent");

            } catch (publishError) {

                console.error(
                    "Failed to publish retry/DLQ message:",
                    publishError.message
                );

                // Do NOT ACK.
                // RabbitMQ will redeliver the original message.
            }
        }
    });
};