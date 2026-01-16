import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate, registerSchema, loginSchema, refreshTokenSchema } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const authRoutes = Router();

authRoutes.post('/refresh', validate(refreshTokenSchema), authController.refreshToken.bind(authController));
authRoutes.post('/register', validate(registerSchema), authController.register.bind(authController));
authRoutes.post('/login', validate(loginSchema), authController.login.bind(authController));

authRoutes.post('/logout', authenticate, authController.logout.bind(authController));
authRoutes.get('/profile', authenticate, authController.getProfile.bind(authController));

export default authRoutes;