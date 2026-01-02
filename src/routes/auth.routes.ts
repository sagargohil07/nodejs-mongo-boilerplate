import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate, registerSchema, loginSchema, refreshTokenSchema } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const authRoutes = Router();

authRoutes.post('/refresh', validate(refreshTokenSchema), AuthController.refreshToken);
authRoutes.post('/register', validate(registerSchema), AuthController.register);
authRoutes.post('/login', validate(loginSchema), AuthController.login);

authRoutes.post('/logout', authenticate, AuthController.logout);
authRoutes.get('/profile', authenticate, AuthController.getProfile);

export default authRoutes;