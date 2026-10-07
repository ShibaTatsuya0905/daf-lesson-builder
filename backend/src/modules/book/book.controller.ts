import { Request, Response } from 'express';
import { BookService } from './book.service';

export class BookController {
  private bookService: BookService;

  constructor() {
    this.bookService = new BookService();
  }

  getAllBooks = async (req: Request, res: Response) => {
    try {
      const books = await this.bookService.getAllBooks();
      res.status(200).json(books);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getLektionsByBook = async (req: Request, res: Response) => {
    try {
      const { bookId } = req.params;
      const lektions = await this.bookService.getLektionsByBook(bookId);
      res.status(200).json(lektions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getLektionDetails = async (req: Request, res: Response) => {
    try {
      const { lektionId } = req.params;
      const details = await this.bookService.getLektionDetails(lektionId);
      if (!details) {
        return res.status(404).json({ message: 'Lektion not found' });
      }
      res.status(200).json(details);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}