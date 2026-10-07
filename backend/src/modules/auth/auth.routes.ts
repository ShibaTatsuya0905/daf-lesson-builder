import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/send-register-otp', authController.sendRegisterOtp);
router.post('/register-with-otp', authController.registerWithOtp);
router.post('/send-forgot-otp', authController.sendForgotOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getMe);

export default router;