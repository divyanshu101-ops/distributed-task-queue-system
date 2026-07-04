import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

let redisClient;

export const connectRedis = async () => {
    try {
        redisClient = createClient({
            url: process.env.REDIS_URL
        })

        await redisClient.connect();

        console.log("Redis Connected");

    } catch (error) {
        console.error("Redis Error:", error.message);
        process.exit(1);
    }
}

export const getRedisClient = () => {
    if (!redisClient) {
        throw new Error("Redis client is not initialized");
    }

    return redisClient;
};