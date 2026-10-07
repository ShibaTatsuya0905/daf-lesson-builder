import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { AdminController } from './admin.controller';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware';

const uploadDir = 'temp_uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'));
  }
});

const upload = multer({ storage });
const router = Router();
const adminController = new AdminController();

router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

router.get('/books', adminController.getBooks);
router.post('/books', adminController.createBook);
router.put('/books/:id', adminController.updateBook);
router.delete('/books/:id', adminController.deleteBook);

router.put('/lektions/:id', adminController.updateLektion);
router.put('/lektions/:id/contents', adminController.updateLektionContents);
router.delete('/lektions/:id', adminController.deleteLektion);

router.post('/books/detect-toc', upload.single('file'), adminController.detectTOC);
router.post('/books/auto-ingest-lektion', upload.array('files', 10), adminController.autoIngestLektion);

export default router;