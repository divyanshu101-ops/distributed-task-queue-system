import dotenv from "dotenv";
dotenv.config();

import "./config/db.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

// RabbitMQ connect karo
await connectRabbitMQ();

// Server start karo
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});