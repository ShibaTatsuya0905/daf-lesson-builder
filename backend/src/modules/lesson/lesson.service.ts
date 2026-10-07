import { LessonRepository } from './lesson.repository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LessonService {
  private lessonRepository: LessonRepository;

  constructor() {
    this.lessonRepository = new LessonRepository();
  }

  async getAllLessons(query: any) {
    return this.lessonRepository.findMany({
      search: query.search,
      searchFields: ['title', 'topic', 'level'],
      filter: { userId: query.userId },
      sort: query.sort,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 50,
    });
  }

  async getLessonById(id: string) {
    return this.lessonRepository.getLessonWithBlocks(id);
  }

  async createLesson(data: any) {
    const { blocks, ...lessonData } = data;
    return prisma.lesson.create({
      data: {
        ...lessonData,
        blocks: {
          create: blocks?.map((b: any) => ({
            type: b.type,
            title: b.title,
            content: b.content,
            duration: b.duration,
            order: b.order,
            isCollapsed: b.isCollapsed,
            data: b.data,
          })) || [],
        },
      },
    });
  }

  async updateLesson(id: string, data: any) {
    const { blocks, ...lessonData } = data;
    
    await prisma.block.deleteMany({ where: { lessonId: id } });

    return prisma.lesson.update({
      where: { id },
      data: {
        ...lessonData,
        blocks: {
          create: blocks?.map((b: any) => ({
            type: b.type,
            title: b.title,
            content: b.content,
            duration: b.duration,
            order: b.order,
            isCollapsed: b.isCollapsed,
            data: b.data,
          })) || [],
        },
      },
    });
  }

  async deleteLesson(id: string) {
    return this.lessonRepository.softDelete(id);
  }
}