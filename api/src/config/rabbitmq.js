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
        console.log();

        await channel.assertExchange(
            process.env.MAIN_EXCHANGE,
            "direct",
            {
                durable: true,
            }
        );
        console.log("Main Exchange Ready");
        console.log();
    } catch (error) {
        console.error(" RabbitMQ Error:", error.message);
        process.exit(1);
    }
};

export const publishJob = async (job) => {
    if (!channel) {
        throw new Error("RabbitMQ channel is not initialized");
    }

    try {

        const published = channel.publish(
            process.env.MAIN_EXCHANGE,
            process.env.ROUTING_KEY,
            Buffer.from(JSON.stringify(job)),
            {
                persistent: true,
            }
        );

        if(published){
            console.log("Job Published Successfully");
        }
    } catch (error) {
        console.error("Publish Error:", error.message);
    }
};

export const getChannel = () => {
    return channel;
};