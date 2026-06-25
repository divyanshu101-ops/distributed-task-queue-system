import amqp from "amqplib";
import dotenv from "dotenv";

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

    } catch (error) {
        console.error("RabbitMQ Error:", error.message);
        process.exit(1);
    }
};

export const consumeJobs = async () => {
    console.log("👂 Waiting for jobs...");

    channel.consume(process.env.QUEUE_NAME, (msg) => {

        if (!msg) return;

        const job = JSON.parse(msg.content.toString());

        console.log("📩 Job Received:");
        console.log(job);

    });
};