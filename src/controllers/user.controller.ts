import { Request, Response } from 'express';
import User from '../models/user.model';
import { ResponseUtil } from '../utils/response.util';

export class UserController {
  // Get all users with pagination
  static async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const searchQuery = req.query.search
        ? {
            $or: [
              { name: { $regex: String(req.query.search), $options: 'i' } },  // Cast to string
              { email: { $regex: String(req.query.search), $options: 'i' } }   // Cast to string
            ]
          }
        : {};
      // Get total count
      const total = await User.countDocuments(searchQuery);

      // Get users
      const users = await User.find(searchQuery)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalPages = Math.ceil(total / limit);

      return ResponseUtil.success(
        res,
        'Users retrieved successfully',
        users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        })),
        {
          page,
          limit,
          total,
          totalPages
        }
      );
    } catch (error) {
      return ResponseUtil.internalServerError(res, 'Failed to get users', error);
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);

      if (!user) {
        return ResponseUtil.notFound(res, 'User not found');
      }

      return ResponseUtil.success(res, 'User retrieved successfully', {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      });
    } catch (error) {
      return ResponseUtil.internalServerError(res, 'Failed to get user', error);
    }
  }

  // Update user
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      // Check if trying to update to an existing email
      if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
          return ResponseUtil.badRequest(res, 'Email already in use');
        }
      }

      const user = await User.findByIdAndUpdate(
        id,
        { name, email },
        { new: true, runValidators: true }
      );

      if (!user) {
        return ResponseUtil.notFound(res, 'User not found');
      }

      return ResponseUtil.success(res, 'User updated successfully', {
        id: user._id,
        name: user.name,
        email: user.email,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      return ResponseUtil.internalServerError(res, 'Failed to update user', error);
    }
  }

  // Delete user
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return ResponseUtil.notFound(res, 'User not found');
      }

      return ResponseUtil.success(res, 'User deleted successfully', {
        id: user._id
      });
    } catch (error) {
      return ResponseUtil.internalServerError(res, 'Failed to delete user', error);
    }
  }
}