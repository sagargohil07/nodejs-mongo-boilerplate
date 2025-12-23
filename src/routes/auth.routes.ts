import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate, registerSchema, loginSchema } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);

export default router;