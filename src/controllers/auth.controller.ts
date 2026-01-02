import { Request, Response } from 'express';
import User from '../models/user.model';
import { JWTUtil } from '../utils/jwt.util';
import { ResponseUtil } from '../utils/response.util';
import bcrypt from 'bcryptjs';

export class AuthController {

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ResponseUtil.badRequest(res, 'Refresh token is required');
      }

      const decoded = JWTUtil.verifyRefreshToken(refreshToken);

      if (!decoded) {
        return ResponseUtil.unauthorized(res, 'Invalid or expired refresh token');
      }

      const user = await User.findById(decoded.userId).select('+refreshToken');

      if (!user || user.refreshToken !== refreshToken) {
        return ResponseUtil.unauthorized(res, 'Invalid refresh token');
      }

      const newAccessToken = JWTUtil.generateToken({
        userId: user._id.toString(),
        email: user.email
      });

      return ResponseUtil.success(res, 'Token refreshed successfully', {
        accessToken: newAccessToken
      });
    } catch (error) {
      return ResponseUtil.internalServerError(res, 'Token refresh failed', error);
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ResponseUtil.badRequest(res, 'Email already registered');
      }

      const user = await User.create({
        name,
        email,
        password
      });

      const accessToken = JWTUtil.generateToken({
        userId: user._id.toString(),
        email: user.email
      });

      const refreshToken = JWTUtil.generateRefreshToken({
        userId: user._id.toString(),
        email: user.email
      });

      user.refreshToken = refreshToken;
      await user.save();

      return ResponseUtil.created(res, 'User registered successfully', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      return ResponseUtil.internalServerError(res, 'Registration failed', error);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return ResponseUtil.unauthorized(res, 'Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return ResponseUtil.unauthorized(res, 'Invalid credentials');
      }

      const accessToken = JWTUtil.generateToken({
        userId: user._id.toString(),
        email: user.email
      });

      const refreshToken = JWTUtil.generateRefreshToken({
        userId: user._id.toString(),
        email: user.email
      });

      user.refreshToken = refreshToken;
      await user.save();

      return ResponseUtil.success(res, 'Login successful', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      return ResponseUtil.internalServerError(res, 'Login failed', error);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.unauthorized(res, 'User not authenticated');
      }

      await User.findByIdAndUpdate(userId, { refreshToken: null });

      return ResponseUtil.success(res, 'Logout successful');
    } catch (error) {
      return ResponseUtil.internalServerError(res, 'Logout failed', error);
    }
  }

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