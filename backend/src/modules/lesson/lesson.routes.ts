import { Router } from 'express';
import { LessonController } from './lesson.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();
const lessonController = new LessonController();

router.use(authenticateToken);

router.get('/', lessonController.getAll);
router.get('/:id', lessonController.getById);
router.post('/', lessonController.create);
router.put('/:id', lessonController.update);
router.delete('/:id', lessonController.delete);

export default router;