import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database Connected Successfully");
} catch (err) {
    console.error("Database Connection Failed");
    console.error(err.message);
}

export default pool;