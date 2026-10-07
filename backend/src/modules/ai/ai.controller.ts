import { Request, Response } from 'express';
import { AIService } from './ai.service';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  slicePdf = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng tải lên file PDF cần cắt.' });
      }

      const { startPage, endPage } = req.body;
      const pdfBytes = await this.aiService.slicePdfFile(
        req.file,
        Number(startPage) || 1,
        Number(endPage) || 1
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="sliced-document.pdf"');
      res.send(Buffer.from(pdfBytes));
    } catch (error: any) {
      console.error('Lỗi cắt PDF:', error);
      res.status(500).json({ message: error.message || 'Lỗi xử lý cắt PDF' });
    }
  };

  scanDocument = async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'Không có file nào được tải lên.' });
      }

      const result = await this.aiService.scanDocument(files);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Lỗi API Quét PDF:', error);
      res.status(500).json({ message: error.message || 'Lỗi xử lý AI' });
    }
  };

  generateExam = async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { topic, level, duration, parts, certificate } = req.body;

      const parsedParts = typeof parts === 'string' ? JSON.parse(parts) : parts || ['Leseverstehen', 'Sprachbausteine', 'Schreiben'];

      const result = await this.aiService.generateExam({
        topic: topic || 'Allgemeine Deutschprüfung',
        level: level || 'B1',
        duration: Number(duration) || 60,
        parts: parsedParts,
        certificate: certificate || 'GOETHE',
        files: files || [],
      });

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Lỗi Tạo Đề Thi:', error);
      res.status(500).json({ message: error.message || 'Lỗi tạo đề thi' });
    }
  };

  generateLesson = async (req: Request, res: Response) => {
    try {
      const result = await this.aiService.generateLesson(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  enrichVocabulary = async (req: Request, res: Response) => {
    try {
      const result = await this.aiService.enrichVocabulary(req.body.topic);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  simulateSpeaking = async (req: Request, res: Response) => {
    try {
      const { level, topic, history, certificate, sessionState } = req.body;
      const result = await this.aiService.simulateSpeakingTurn(
        level || 'B1',
        topic || 'Alltag und Beruf',
        history || [],
        certificate || 'Goethe-Zertifikat',
        sessionState
      );
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Lỗi Mündliche Prüfung:', error);
      res.status(500).json({ message: error.message || 'Lỗi mô phỏng thi nói' });
    }
  };
}