import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt.util';
import { ResponseUtil } from '../utils/response.util';
import User from '../models/user.model';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtil.unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = JWTUtil.verifyToken(token);

    if (!decoded) {
      return ResponseUtil.unauthorized(res, 'Invalid or expired token');
    }

    // Check if user exists
    const user = await User.findById(decoded.userId);

    if (!user) {
      return ResponseUtil.unauthorized(res, 'User not found');
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    return ResponseUtil.internalServerError(res, 'Authentication failed', error);
  }
};