import { Request, Response } from "express";
import User from "../models/user.model";
import { JWTUtil } from "../utils/jwt.util";
import bcrypt from "bcryptjs";

class AuthController {
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          status: 400,
          message: "Refresh token is required",
        });
      }

      const decoded = JWTUtil.verifyRefreshToken(refreshToken);

      if (!decoded) {
        return res.status(401).json({
          status: 401,
          message: "Invalid or expired refresh token",
        });
      }

      const user = await User.findById(decoded.userId).select("+refreshToken");

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({
          status: 401,
          message: "Invalid refresh token",
        });
      }

      const newAccessToken = JWTUtil.generateToken({
        userId: user._id.toString(),
        email: user.email,
      });

      return res.status(200).json({
        status: 200,
        message: "Token refreshed successfully",
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Token refresh failed",
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 400,
          message: "Email already registered",
        });
      }

      const user = await User.create({
        name,
        email,
        password,
      });

      const accessToken = JWTUtil.generateToken({
        userId: user._id.toString(),
        email: user.email,
      });

      const refreshToken = JWTUtil.generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
      });

      user.refreshToken = refreshToken;
      await user.save();

      return res.status(201).json({
        status: 201,
        message: "User registered successfully",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Registration failed",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(401).json({
          status: 401,
          message: "Invalid credentials",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          status: 401,
          message: "Invalid credentials",
        });
      }

      const accessToken = JWTUtil.generateToken({
        userId: user._id.toString(),
        email: user.email,
      });

      const refreshToken = JWTUtil.generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
      });

      user.refreshToken = refreshToken;
      await user.save();

      return res.status(200).json({
        status: 200,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Login failed",
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          status: 401,
          message: "User not authenticated",
        });
      }

      await User.findByIdAndUpdate(userId, { refreshToken: null });

      return res.status(200).json({
        status: 200,
        message: "Logout successful",
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Logout failed",
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = await User.findById(req.user?.userId);

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Profile retrieved successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Failed to get profile",
      });
    }
  }
}

export const authController = new AuthController();
