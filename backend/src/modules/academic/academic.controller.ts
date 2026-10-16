import { Request, Response } from 'express';
import { AcademicService } from './academic.service';

export class AcademicController {
  private service = new AcademicService();

  getAdminClasses = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getAdminClasses();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  };

  createClass = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createClass(req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };

  updateClass = async (req: Request, res: Response) => {
    try {
      const data = await this.service.updateClass(req.params.id as string, req.body);
      res.json(data);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };

  deleteClass = async (req: Request, res: Response) => {
    try {
      await this.service.deleteClass(req.params.id as string);
      res.status(204).send();
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  };

  getAllStudents = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getAllStudents();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  };

  addStudent = async (req: Request, res: Response) => {
    try {
      const data = await this.service.addStudent(req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };

  batchAddStudents = async (req: Request, res: Response) => {
    try {
      const { students } = req.body;
      const data = await this.service.batchAddStudents(students || []);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };

  deleteStudent = async (req: Request, res: Response) => {
    try {
      await this.service.deleteStudent(req.params.id as string);
      res.status(204).send();
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  };

  getAdminSchedules = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getAdminSchedules();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  };

  createSchedule = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createSchedule(req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };

  deleteSchedule = async (req: Request, res: Response) => {
    try {
      await this.service.deleteSchedule(req.params.id as string);
      res.status(204).send();
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  };

  getTeacherClasses = async (req: Request, res: Response) => {
    try {
      const teacherId = req.user!.userId;
      const data = await this.service.getTeacherClasses(teacherId);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  };

  getTeacherSchedules = async (req: Request, res: Response) => {
    try {
      const teacherId = req.user!.userId;
      const data = await this.service.getTeacherSchedules(teacherId);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  };

  saveEvaluation = async (req: Request, res: Response) => {
    try {
      const teacherId = req.user!.userId;
      const data = await this.service.saveEvaluation({ ...req.body, teacherId });
      res.status(200).json(data);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };
}