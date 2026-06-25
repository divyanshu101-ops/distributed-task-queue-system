import "./config/db.js";
import { connectRabbitMQ, consumeJobs } from "./config/rabbitmq.js";

await connectRabbitMQ();

await consumeJobs();