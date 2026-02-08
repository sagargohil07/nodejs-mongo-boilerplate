import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, updateUserSchema } from '../middlewares/validation.middleware';

const userRoutes = Router();

userRoutes.use(authenticate);

userRoutes.get('/', userController.getAllUsers);
userRoutes.get('/:id', userController.getUserById);
userRoutes.put('/:id', validate(updateUserSchema), userController.updateUser);
userRoutes.delete('/:id', userController.deleteUser);

export default userRoutes;