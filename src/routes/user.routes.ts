import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, updateUserSchema } from '../middlewares/validation.middleware';

const userRoutes = Router();

// All user routes are protected
userRoutes.use(authenticate);

// User CRUD routes
userRoutes.get('/', UserController.getAllUsers);
userRoutes.get('/:id', UserController.getUserById);
userRoutes.put('/:id', validate(updateUserSchema), UserController.updateUser);
userRoutes.delete('/:id', UserController.deleteUser);

export default userRoutes;