import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import authRoutes from './modules/auth/auth.routes';
import lessonRoutes from './modules/lesson/lesson.routes';
import bookRoutes from './modules/book/book.routes';
import aiRoutes from './modules/ai/ai.routes';
import adminRoutes from './modules/admin/admin.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

async function initSuperAdmin() {
  try {
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN', isDeleted: false },
    });

    if (!adminExists) {
      const defaultEmail = process.env.ADMIN_EMAIL || 'admin@daf.de';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin@DaF#2026_SecureKey!';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      await prisma.user.create({
        data: {
          email: defaultEmail,
          password: hashedPassword,
          name: 'Super Administrator',
          role: 'ADMIN',
        },
      });

      console.log('\n======================================================');
      console.log('🛡️  [SUPER ADMIN AUTO-INITIALIZED]:');
      console.log(`📧  Email:    ${defaultEmail}`);
      console.log(`🔑  Password: ${defaultPassword}`);
      console.log('======================================================\n');
    }
  } catch (error: any) {
    console.error('Lỗi khởi tạo Super Admin:', error.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initSuperAdmin();
});