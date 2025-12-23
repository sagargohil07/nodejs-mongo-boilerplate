import { Request, Response } from 'express';
import User from '../models/user.model';
import { JWTUtil } from '../utils/jwt.util';
import { ResponseUtil } from '../utils/response.util';

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ResponseUtil.badRequest(res, 'Email already registered');
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password
      });

      // Generate token
      const token = JWTUtil.generateToken({
        userId: user._id.toString(),
        email: user.email
      });

      return ResponseUtil.created(res, 'User registered successfully', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      });
    } catch (error) {
      return ResponseUtil.internalServerError(res, 'Registration failed', error);
    }
  }

  // Login user
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user with password field
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return ResponseUtil.unauthorized(res, 'Invalid credentials');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return ResponseUtil.unauthorized(res, 'Invalid credentials');
      }

      // Generate token
      const token = JWTUtil.generateToken({
        userId: user._id.toString(),
        email: user.email
      });

      return ResponseUtil.success(res, 'Login successful', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      });
    } catch (error) {
      return ResponseUtil.internalServerError(res, 'Login failed', error);
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response) {
    try {
      const user = await User.findById(req.user?.userId);

      if (!user) {
        return ResponseUtil.notFound(res, 'User not found');
      }

      return ResponseUtil.success(res, 'Profile retrieved successfully', {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      });
    } catch (error) {
      return ResponseUtil.internalServerError(res, 'Failed to get profile', error);
    }
  }
}