import { BookRepository } from './book.repository';

export class BookService {
  private bookRepository: BookRepository;

  constructor() {
    this.bookRepository = new BookRepository();
  }

  async getAllBooks() {
    return this.bookRepository.findAllBooks();
  }

  async getLektionsByBook(bookId: string) {
    return this.bookRepository.findLektionsByBookId(bookId);
  }

  async getLektionDetails(lektionId: string) {
    return this.bookRepository.findLektionWithContents(lektionId);
  }
}