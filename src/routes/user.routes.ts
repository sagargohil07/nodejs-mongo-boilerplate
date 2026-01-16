import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, updateUserSchema } from '../middlewares/validation.middleware';

const userRoutes = Router();

userRoutes.use(authenticate);

userRoutes.get('/', userController.getAllUsers.bind(userController));
userRoutes.get('/:id', userController.getUserById.bind(userController));
userRoutes.put('/:id', validate(updateUserSchema), userController.updateUser.bind(userController));
userRoutes.delete('/:id', userController.deleteUser.bind(userController));

export default userRoutes;