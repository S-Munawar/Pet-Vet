import express from "express";
import type { Request, Response } from "express";
import { connectDB } from "./config/db.ts";
import authRoutes from "./routes/auth.ts";
import licenseRoutes from "./routes/licenses.ts";
import dotenv from "dotenv";
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Simple CORS middleware for development: allow the frontend origin
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use((req: Request, res: Response, next: Function) => {
  res.header('Access-Control-Allow-Origin', CLIENT_URL);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    return res.sendStatus(200);
  }
  next();
});

app.use("/auth", authRoutes);
app.use("/api/licenses", licenseRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
