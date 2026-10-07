import { BaseRepository } from '../../common/base.repository';
import prisma from '../../common/prisma';

export class BookRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.book);
  }

  async findAllBooks() {
    return prisma.book.findMany({
      include: {
        lektions: {
          include: {
            contents: true,
          },
          orderBy: { lektionNumber: 'asc' },
        },
      },
      orderBy: { title: 'asc' },
    });
  }

  async findLektionsByBookId(bookId: string) {
    return prisma.lektion.findMany({
      where: { bookId },
      orderBy: { lektionNumber: 'asc' },
    });
  }

  async findLektionWithContents(lektionId: string) {
    return prisma.lektion.findUnique({
      where: { id: lektionId },
      include: {
        contents: true,
      },
    });
  }
}