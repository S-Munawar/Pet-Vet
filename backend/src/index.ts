import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.ts';
import authRoutes from './routes/auth.ts';
import licenseRoutes from './routes/licenses.ts';
import agentRoutes from './routes/agent.ts';
import vetsRoutes from './routes/vets.ts';
import petsRoutes from './routes/pets.ts';
import { devCors } from './middlewares/cors.ts';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(devCors());

app.use('/auth', authRoutes);
app.use('/licenses', licenseRoutes);
app.use('/vets', vetsRoutes);
app.use('/pets', petsRoutes);
app.use('/agent', agentRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express + TypeScript!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
