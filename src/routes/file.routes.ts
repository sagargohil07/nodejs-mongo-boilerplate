import { Router } from 'express';
import { fileController } from '../controllers/file.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const fileRoutes = Router();

fileRoutes.use(authenticate);
fileRoutes.post('/upload', uploadMiddleware.single('file'), fileController.uploadFile);

export default fileRoutes;
