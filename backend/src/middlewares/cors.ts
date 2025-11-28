import type { Request, Response, NextFunction } from 'express';

export function devCors() {
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  return (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', CLIENT_URL);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      return res.sendStatus(200);
    }
    next();
  };
}
