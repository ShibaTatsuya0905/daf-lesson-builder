import { AIService } from '../ai/ai.service';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import prisma from '../../common/prisma';

export class AdminService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async getAllUsers() {
    return prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, role: 'ADMIN' | 'TEACHER') {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  async deleteUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true },
    });
  }

  async getAllBooksWithLektions() {
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

  async createBook(data: { title: string; publisher: string; level: string; coverUrl?: string }) {
    return prisma.book.create({
      data: {
        title: data.title,
        publisher: data.publisher,
        level: data.level,
        coverUrl: data.coverUrl || '',
      },
    });
  }

  async updateBook(bookId: string, data: { title?: string; publisher?: string; level?: string }) {
    return prisma.book.update({
      where: { id: bookId },
      data,
    });
  }

  async deleteBook(bookId: string) {
    await prisma.lektionContent.deleteMany({
      where: {
        lektion: {
          bookId,
        },
      },
    });

    await prisma.lektion.deleteMany({
      where: { bookId },
    });

    return prisma.book.delete({
      where: { id: bookId },
    });
  }

  async updateLektion(lektionId: string, data: { lektionNumber?: number; title?: string; theme?: string }) {
    return prisma.lektion.update({
      where: { id: lektionId },
      data: {
        lektionNumber: data.lektionNumber ? Number(data.lektionNumber) : undefined,
        title: data.title,
        theme: data.theme,
      },
    });
  }

  async updateLektionContents(lektionId: string, contents: { type: string; data: any }[]) {
    await prisma.lektionContent.deleteMany({
      where: { lektionId },
    });

    return prisma.lektion.update({
      where: { id: lektionId },
      data: {
        contents: {
          create: contents.map((c) => ({
            type: c.type,
            data: c.data,
          })),
        },
      },
      include: {
        contents: true,
      },
    });
  }

  async deleteLektion(lektionId: string) {
    await prisma.lektionContent.deleteMany({
      where: { lektionId },
    });

    return prisma.lektion.delete({
      where: { id: lektionId },
    });
  }

  async slicePdfPages(inputPath: string, startPage: number, endPage: number): Promise<string> {
    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const subDoc = await PDFDocument.create();

    const totalPages = pdfDoc.getPageCount();
    const start = Math.max(1, startPage);
    const end = Math.min(totalPages, endPage);

    const pageIndices: number[] = [];
    for (let i = start - 1; i < end; i++) {
      pageIndices.push(i);
    }

    const copiedPages = await subDoc.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach((page: any) => subDoc.addPage(page));

    const subPdfBytes = await subDoc.save();
    const outputPath = path.join(path.dirname(inputPath), `sliced-${Date.now()}-${path.basename(inputPath)}`);
    fs.writeFileSync(outputPath, subPdfBytes);

    return outputPath;
  }

  async detectBookTOC(file: Express.Multer.File) {
    if (file.mimetype !== 'application/pdf') {
      throw new Error('Chỉ hỗ trợ quét mục lục tự động cho file PDF.');
    }

    const tocSlicePath = await this.slicePdfPages(file.path, 1, 8);
    const slicedFile: Express.Multer.File = {
      ...file,
      path: tocSlicePath,
      filename: path.basename(tocSlicePath),
      size: fs.statSync(tocSlicePath).size,
    };

    return await this.aiService.detectTableOfContents(slicedFile);
  }

  async autoIngestLektionFromAI(
    bookId: string,
    files: Express.Multer.File[],
    lektionNumber: number,
    title: string,
    theme: string,
    startPage?: number,
    endPage?: number
  ) {
    let filesToSendToAI = [...files];
    const temporarySlicedFiles: string[] = [];

    try {
      if (startPage && endPage && files.length === 1 && files[0].mimetype === 'application/pdf') {
        const slicedFilePath = await this.slicePdfPages(files[0].path, Number(startPage), Number(endPage));
        temporarySlicedFiles.push(slicedFilePath);

        const slicedFile: Express.Multer.File = {
          ...files[0],
          path: slicedFilePath,
          filename: path.basename(slicedFilePath),
          size: fs.statSync(slicedFilePath).size,
        };

        filesToSendToAI = [slicedFile];
      }

      const aiResult = await this.aiService.scanDocument(filesToSendToAI);

      const vocabBlock = aiResult.blocks.find((b: any) => b.type === 'Wortschatz');
      const speakingBlock = aiResult.blocks.find((b: any) => b.type === 'Sprechen');

      const vocabularyData = vocabBlock?.data?.vocabulary || [];
      const redemittelData = speakingBlock?.data?.sentenceStarters || [];

      const newLektion = await prisma.lektion.create({
        data: {
          bookId,
          lektionNumber: Number(lektionNumber),
          title: title || aiResult.topic || `Lektion ${lektionNumber}`,
          theme: theme || aiResult.topic || '',
          contents: {
            create: [
              {
                type: 'VOCAB',
                data: vocabularyData,
              },
              {
                type: 'REDEMITTEL',
                data: redemittelData,
              },
            ],
          },
        },
        include: {
          contents: true,
        },
      });

      return newLektion;
    } finally {
      for (const tempPath of temporarySlicedFiles) {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    }
  }
}