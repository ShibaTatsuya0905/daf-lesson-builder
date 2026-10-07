import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, isDeleted: false },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async createUser(data: { email: string; password: string; name: string; role?: 'ADMIN' | 'TEACHER' }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updateUserPassword(email: string, newPasswordHash: string) {
    return prisma.user.update({
      where: { email },
      data: { password: newPasswordHash },
    });
  }

  async saveOtp(email: string, code: string, type: 'REGISTER' | 'FORGOT_PASSWORD', expiresAt: Date) {
    await prisma.otp.deleteMany({
      where: { email, type },
    });

    return prisma.otp.create({
      data: {
        email,
        code,
        type,
        expiresAt,
      },
    });
  }

  async findValidOtp(email: string, code: string, type: 'REGISTER' | 'FORGOT_PASSWORD') {
    return prisma.otp.findFirst({
      where: {
        email,
        code,
        type,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async deleteOtp(email: string, type: 'REGISTER' | 'FORGOT_PASSWORD') {
    return prisma.otp.deleteMany({
      where: { email, type },
    });
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async deleteAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}