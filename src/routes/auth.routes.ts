import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate, registerSchema, loginSchema, refreshTokenSchema } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const authRoutes = Router();

authRoutes.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
authRoutes.post('/register', validate(registerSchema), authController.register);
authRoutes.post('/login', validate(loginSchema), authController.login);

authRoutes.post('/logout', authenticate, authController.logout);
authRoutes.get('/profile', authenticate, authController.getProfile);

export default authRoutes;