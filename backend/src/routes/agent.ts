import express from 'express';
import { Router } from 'express';
import { chatHandler } from '../controllers/agent.controller.ts';
import { requireAuth } from '../middlewares/auth.ts';

const router: Router = express.Router();

router.post('/chat',requireAuth, chatHandler);
// router.post('/image', requireAuth, imageHandler);

export default router;