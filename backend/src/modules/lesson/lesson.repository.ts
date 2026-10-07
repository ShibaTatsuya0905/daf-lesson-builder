import { PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../common/base.repository';

const prisma = new PrismaClient();

export class LessonRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.lesson);
  }

  async getLessonWithBlocks(id: string) {
    return prisma.lesson.findFirst({
      where: { id, isDeleted: false },
      include: {
        blocks: {
          where: { isDeleted: false },
          orderBy: { order: 'asc' },
        },
      },
    });
  }
}