import "./config/db.js";
import { connectRabbitMQ, consumeJobs } from "./config/rabbitmq.js";
import { connectRedis } from "./config/redis.js";

await connectRedis();

await connectRabbitMQ();

await consumeJobs();