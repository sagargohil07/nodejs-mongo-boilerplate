import { Request, Response } from 'express';
import User from '../models/user.model';

class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const searchQuery = req.query.search ? {
        $or: [
          { name: { $regex: String(req.query.search), $options: 'i' } },
          { email: { $regex: String(req.query.search), $options: 'i' } }
        ]
      } : {};

      const total = await User.countDocuments(searchQuery);

      const users = await User.find(searchQuery)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalPages = Math.ceil(total / limit);

      const userDetails = users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }));

      return res.status(200).json({
        status: 200,
        message: 'Users retrieved successfully',
        data: userDetails,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Failed to get users'
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        status: 200,
        message: 'User retrieved successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Failed to get user'
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
          return res.status(400).json({
            status: 400,
            message: 'Email already in use'
          });
        }
      }

      const user = await User.findByIdAndUpdate(
        id,
        { name, email },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        status: 200,
        message: 'User updated successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Failed to update user'
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        status: 200,
        message: 'User deleted successfully',
        data: {
          id: user._id
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Failed to delete user'
      });
    }
  }
}

export const userController = new UserController();