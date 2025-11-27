import express from "express";
import type { Request, Response } from "express";
import { connectDB } from "./config/db.ts";
import authRoutes from "./routes/auth.ts";
import dotenv from "dotenv";
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
