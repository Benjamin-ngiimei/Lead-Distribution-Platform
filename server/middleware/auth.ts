import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include agent property
declare global {
  namespace Express {
    interface Request {
      agent?: { id: string };
    }
  }
}

export default function (req: Request, res: Response, next: NextFunction) {
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in .env file');
    }
    const decoded = jwt.verify(token, jwtSecret) as { agent: { id: string } };
    req.agent = decoded.agent;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
