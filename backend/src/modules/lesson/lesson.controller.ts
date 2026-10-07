import { Request, Response } from 'express';
import { LessonService } from './lesson.service';

export class LessonController {
  private lessonService: LessonService;

  constructor() {
    this.lessonService = new LessonService();
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const result = await this.lessonService.getAllLessons({ ...req.query, userId });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const result = await this.lessonService.getLessonById(req.params.id as string);
      if (!result || result.userId !== req.user!.userId) {
        return res.status(404).json({ message: 'Not found or unauthorized' });
      }
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const result = await this.lessonService.createLesson({ ...req.body, userId });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const result = await this.lessonService.updateLesson(req.params.id as string, req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.lessonService.deleteLesson(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}