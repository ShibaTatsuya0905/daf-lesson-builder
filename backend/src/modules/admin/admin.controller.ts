import { Request, Response } from 'express';
import { AdminService } from './admin.service';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  getUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.adminService.getAllUsers();
      res.status(200).json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  updateUserRole = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const updated = await this.adminService.updateUserRole(id, role);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.adminService.deleteUser(id);
      res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getBooks = async (req: Request, res: Response) => {
    try {
      const books = await this.adminService.getAllBooksWithLektions();
      res.status(200).json(books);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  createBook = async (req: Request, res: Response) => {
    try {
      const { title, publisher, level, coverUrl } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Tên cuốn sách không được để trống.' });
      }

      const book = await this.adminService.createBook({
        title: title.trim(),
        publisher: publisher ? publisher.trim() : '',
        level: level || 'A1',
        coverUrl: coverUrl || '',
      });

      res.status(201).json(book);
    } catch (error: any) {
      console.error('Lỗi tạo sách:', error);
      res.status(500).json({ message: error.message || 'Lỗi khi lưu sách vào cơ sở dữ liệu' });
    }
  };

  updateBook = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await this.adminService.updateBook(id, req.body);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Lỗi cập nhật sách' });
    }
  };

  deleteBook = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.adminService.deleteBook(id);
      res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  updateLektion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await this.adminService.updateLektion(id, req.body);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Lỗi cập nhật bài học' });
    }
  };

  updateLektionContents = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { contents } = req.body;
      const updated = await this.adminService.updateLektionContents(id, contents || []);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Lỗi cập nhật nội dung bài học' });
    }
  };

  deleteLektion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.adminService.deleteLektion(id);
      res.status(200).json({ message: 'Lektion deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  detectTOC = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng tải lên file PDF sách.' });
      }
      const toc = await this.adminService.detectBookTOC(req.file);
      res.status(200).json(toc);
    } catch (error: any) {
      console.error('Lỗi Quét Mục Lục:', error);
      res.status(500).json({ message: error.message || 'Lỗi quét mục lục sách' });
    }
  };

  autoIngestLektion = async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { bookId, lektionNumber, title, theme, startPage, endPage } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'Vui lòng tải lên tài liệu Lektion (PDF hoặc Ảnh).' });
      }

      const lektion = await this.adminService.autoIngestLektionFromAI(
        bookId,
        files,
        lektionNumber,
        title,
        theme,
        startPage ? Number(startPage) : undefined,
        endPage ? Number(endPage) : undefined
      );

      res.status(201).json(lektion);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}