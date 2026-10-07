import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { AuthRepository } from './auth.repository';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  private validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private validatePassword(password: string): boolean {
    return typeof password === 'string' && password.length >= 8;
  }

  private generateAccessToken(user: { id: string; email: string; role: string }) {
    const secret = process.env.JWT_ACCESS_SECRET || 'daf_access_secret';
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';

    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: expiresIn as any }
    );
  }

  private generateRefreshToken(user: { id: string; email: string; role: string }) {
    const secret = process.env.JWT_REFRESH_SECRET || 'daf_refresh_secret';
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: expiresIn as any }
    );
  }

  private async sendEmail(to: string, subject: string, html: string, code: string) {
    console.log(`\n==============================================`);
    console.log(`[MÃ OTP CHO ${to}]: ${code}`);
    console.log(`==============================================\n`);

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"DaF Lesson Builder" <${process.env.SMTP_USER}>`,
          to,
          subject,
          html,
        });
      } catch (err) {
        console.error('Lỗi gửi email thực tế:', err);
      }
    }
  }

  async sendRegisterOtp(data: { email: string; password: string }) {
    if (!this.validateEmail(data.email)) {
      throw new Error('Định dạng email không hợp lệ');
    }

    if (!this.validatePassword(data.password)) {
      throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
    }

    const existing = await this.authRepository.findUserByEmail(data.email);
    if (existing) {
      throw new Error('Email này đã được đăng ký tài khoản');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.authRepository.saveOtp(data.email, otpCode, 'REGISTER', expiresAt);

    await this.sendEmail(
      data.email,
      'Mã xác thực đăng ký tài khoản DaF Lesson Builder',
      `<h2>Chào mừng bạn đến với DaF Lesson Builder</h2><p>Mã OTP xác thực đăng ký của bạn là: <strong style="font-size: 24px; color: #2563eb;">${otpCode}</strong></p><p>Mã có hiệu lực trong vòng 5 phút.</p>`,
      otpCode
    );

    return { message: 'Mã OTP đã được gửi về email của bạn' };
  }

  async registerWithOtp(data: { email: string; password: string; name: string; otp: string }) {
    if (!this.validateEmail(data.email)) {
      throw new Error('Định dạng email không hợp lệ');
    }

    if (!this.validatePassword(data.password)) {
      throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
    }

    const otpRecord = await this.authRepository.findValidOtp(data.email, data.otp, 'REGISTER');
    if (!otpRecord) {
      throw new Error('Mã OTP không chính xác hoặc đã hết hạn');
    }

    const existing = await this.authRepository.findUserByEmail(data.email);
    if (existing) {
      throw new Error('Email này đã được đăng ký tài khoản');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.authRepository.createUser({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: 'TEACHER',
    });

    await this.authRepository.deleteOtp(data.email, 'REGISTER');

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return { user, accessToken, refreshToken };
  }

  async sendForgotPasswordOtp(email: string) {
    if (!this.validateEmail(email)) {
      throw new Error('Định dạng email không hợp lệ');
    }

    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Không tìm thấy tài khoản với email này');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.authRepository.saveOtp(email, otpCode, 'FORGOT_PASSWORD', expiresAt);

    await this.sendEmail(
      email,
      'Mã OTP khôi phục mật khẩu DaF Lesson Builder',
      `<h2>Yêu cầu đặt lại mật khẩu</h2><p>Mã OTP khôi phục mật khẩu của bạn là: <strong style="font-size: 24px; color: #dc2626;">${otpCode}</strong></p><p>Mã có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho ai khác.</p>`,
      otpCode
    );

    return { message: 'Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn' };
  }

  async resetPasswordWithOtp(data: { email: string; otp: string; newPassword: string }) {
    if (!this.validateEmail(data.email)) {
      throw new Error('Định dạng email không hợp lệ');
    }

    if (!this.validatePassword(data.newPassword)) {
      throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự');
    }

    const otpRecord = await this.authRepository.findValidOtp(data.email, data.otp, 'FORGOT_PASSWORD');
    if (!otpRecord) {
      throw new Error('Mã OTP không chính xác hoặc đã hết hạn');
    }

    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new Error('Không tìm thấy tài khoản');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.authRepository.updateUserPassword(data.email, hashedPassword);

    await this.authRepository.deleteOtp(data.email, 'FORGOT_PASSWORD');
    await this.authRepository.deleteAllUserRefreshTokens(user.id);

    return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' };
  }

  async login(data: { email: string; password: string }) {
    if (!this.validateEmail(data.email)) {
      throw new Error('Định dạng email không hợp lệ');
    }

    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(userPayload);
    const refreshToken = this.generateRefreshToken(userPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return { user: userPayload, accessToken, refreshToken };
  }

  async refresh(token: string) {
    if (!token) {
      throw new Error('Refresh token missing');
    }

    const record = await this.authRepository.findRefreshToken(token);
    if (!record || record.expiresAt < new Date() || record.user.isDeleted) {
      if (record) {
        await this.authRepository.deleteRefreshToken(token);
      }
      throw new Error('Invalid or expired refresh token');
    }

    const secret = process.env.JWT_REFRESH_SECRET || 'daf_refresh_secret';
    try {
      jwt.verify(token, secret);
    } catch {
      await this.authRepository.deleteRefreshToken(token);
      throw new Error('Invalid refresh token');
    }

    const userPayload = {
      id: record.user.id,
      email: record.user.email,
      role: record.user.role,
    };

    const newAccessToken = this.generateAccessToken(userPayload);
    const newRefreshToken = this.generateRefreshToken(userPayload);

    await this.authRepository.deleteRefreshToken(token);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.saveRefreshToken(record.user.id, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(token: string) {
    if (token) {
      await this.authRepository.deleteRefreshToken(token);
    }
  }

  async getProfile(userId: string) {
    return this.authRepository.findUserById(userId);
  }
}