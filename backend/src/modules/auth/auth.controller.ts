import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  sendRegisterOtp = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.sendRegisterOtp({ email, password });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  registerWithOtp = async (req: Request, res: Response) => {
    try {
      const { email, password, name, otp } = req.body;
      const result = await this.authService.registerWithOtp({ email, password, name, otp });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  sendForgotOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = await this.authService.sendForgotPasswordOtp(email);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await this.authService.resetPasswordWithOtp({ email, otp, newPassword });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login({ email, password });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  };

  refresh = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refresh(refreshToken);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(403).json({ message: error.message });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getMe = async (req: Request, res: Response) => {
    try {
      const user = await this.authService.getProfile(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}