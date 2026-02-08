import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt.util';
import User from '../models/user.model';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 401,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = JWTUtil.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid or expired token'
      });
    }

    // Check if user exists
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: 'User not found'
      });
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Authentication failed'
    });
  }
};