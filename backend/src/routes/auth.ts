import express, { Router, type Request, type Response } from 'express';

import agentRoutes from './agent.ts';
import {
  registerHandler,
  verifyEmailHandler,
  manualVerifyHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  googleAuthHandler,
  googleAuthCallbackHandler,
  microsoftAuthHandler,
  microsoftAuthCallbackHandler
} from '../controllers/auth.controller.ts';

const router: Router = express.Router();

router.post('/register', registerHandler);

router.get('/verify-email', verifyEmailHandler);

router.post('/manual-verify', manualVerifyHandler);

router.post('/login', loginHandler);

router.post('/refresh', refreshHandler);

router.post('/logout', logoutHandler);

router.get('/google', googleAuthHandler);

router.get('/microsoft', microsoftAuthHandler);

router.get('/google/callback', googleAuthCallbackHandler);

router.get('/microsoft/callback', microsoftAuthCallbackHandler);

export default router;