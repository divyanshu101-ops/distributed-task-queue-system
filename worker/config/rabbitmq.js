import amqp from "amqplib";
import dotenv from "dotenv";
import { processJob } from "../services/jobProcessor.js";

dotenv.config();

let connection;
let channel;

export const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        console.log("RabbitMQ Connected");

        channel = await connection.createChannel();
        console.log("Channel Created");

        await channel.assertQueue(process.env.QUEUE_NAME);
        console.log(`Queue "${process.env.QUEUE_NAME}" Ready`);

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

        try {

            const job = JSON.parse(msg.content.toString());

            console.log("Job Received:");
            console.log(job);

            await processJob(job);

            // Tell RabbitMQ that job is processed successfully
            channel.ack(msg);

            console.log("ACK Sent");

        } catch (error) {

            console.error("Error Processing Job:", error.message);

            // Abhi intentionally ACK nahi bhejenge.
            // Message queue me rahega.
            // Next chapter me NACK aur Retry implement karenge.
        }

    });
};