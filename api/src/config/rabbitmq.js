import amqp from "amqplib";

let connection;
let channel;

export const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        console.log(" RabbitMQ Connected");

        channel = await connection.createChannel();
        console.log(" Channel Created");

        await channel.assertQueue(process.env.QUEUE_NAME);
        console.log(` Queue "${process.env.QUEUE_NAME}" Created`);
    } catch (error) {
        console.error(" RabbitMQ Error:", error.message);
        process.exit(1);
    }
};

export const publishJob = async (job) => {
    try {

        channel.sendToQueue(
            process.env.QUEUE_NAME,
            Buffer.from(JSON.stringify(job))
        );

        console.log("✅ Job Published Successfully");

    } catch (error) {
        console.error("❌ Publish Error:", error.message);
    }
};

export const getChannel = () => {
    return channel;
};