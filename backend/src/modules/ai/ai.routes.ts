import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { AIController } from './ai.controller';

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
const aiController = new AIController();

router.post('/slice-pdf', upload.single('file'), aiController.slicePdf);
router.post('/scan-document', upload.array('files', 20), aiController.scanDocument);
router.post('/generate-exam', upload.array('files', 10), aiController.generateExam);
router.post('/generate-lesson', aiController.generateLesson);
router.post('/enrich-vocabulary', aiController.enrichVocabulary);
router.post('/simulate-speaking', aiController.simulateSpeaking);

export default router;