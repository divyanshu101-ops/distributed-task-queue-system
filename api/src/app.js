import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import dashboardRoute from "./routes/dashboaard.js";
import jobsRoute from "./routes/jobs.js";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", dashboardRoute);

app.use("/jobs", jobsRoute);

export default app;