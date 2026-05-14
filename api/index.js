import express from "express";
const app = express();
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("*", (req, res) => res.send("Hello from Vercel"));
export default app;
