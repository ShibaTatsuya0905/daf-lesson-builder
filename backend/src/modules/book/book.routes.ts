import { Router } from 'express';
import { BookController } from './book.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();
const bookController = new BookController();

router.use(authenticateToken);

router.get('/', bookController.getAllBooks);
router.get('/:bookId/lektions', bookController.getLektionsByBook);
router.get('/lektion/:lektionId', bookController.getLektionDetails);

export default router;