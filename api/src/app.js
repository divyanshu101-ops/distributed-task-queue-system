import express from "express";
import jobsRoute from "./routes/jobs.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("Distributed Tak Queue API Running");
})

app.use("/jobs", jobsRoute);

export default app;