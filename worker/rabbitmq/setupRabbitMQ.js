import dotenv from "dotenv";

dotenv.config();

export const setupRabbitMQ = async (channel) => {

    // Main Exchange
    await channel.assertExchange(
        process.env.MAIN_EXCHANGE,
        "direct",
        {
            durable: true,
        }
    );
    console.log("Main Exchange Ready");

    // Retry Exchange
    await channel.assertExchange(
        process.env.RETRY_EXCHANGE,
        "direct",
        {
            durable: true,
        }
    );
    console.log("Retry Exchange Ready");

    // Dead Letter Exchange
    await channel.assertExchange(
        process.env.DLX_EXCHANGE,
        "direct",
        {
            durable: true,
        }
    );
    console.log("Dead Letter Exchange Ready");
    console.log();

    // Main Queue
    await channel.assertQueue(
        process.env.QUEUE_NAME,
        {
            durable: true,
        }
    );

    console.log("Main Queue Ready");

    // Retry Queue
    await channel.assertQueue(
        process.env.RETRY_QUEUE,
        {
            durable: true,
            arguments: {
                "x-message-ttl": Number(process.env.BASE_DELAY),
                "x-dead-letter-exchange": process.env.MAIN_EXCHANGE,
                "x-dead-letter-routing-key": process.env.ROUTING_KEY,
            },
        }
    );

    console.log("Retry Queue Ready");

    // DLQ
    await channel.assertQueue(
        process.env.DLQ_NAME,
        {
            durable: true,
        }
    );

    console.log("Dead Letter Queue Ready");
    console.log();

    // Bind Main Queue
    await channel.bindQueue(
        process.env.QUEUE_NAME,
        process.env.MAIN_EXCHANGE,
        process.env.ROUTING_KEY
    );
    console.log("Main Queue Bound Successfully");

    // Bind Retry Queue
    await channel.bindQueue(
        process.env.RETRY_QUEUE,
        process.env.RETRY_EXCHANGE,
        process.env.RETRY_ROUTING_KEY
    );
    console.log("Retry Queue Bound Successfully");


    // Bind Dead Letter Queue
    await channel.bindQueue(
        process.env.DLQ_NAME,
        process.env.DLX_EXCHANGE,
        process.env.DLQ_ROUTING_KEY
    );

    console.log("Dead Letter Queue Bound Successfully");
    console.log();
};