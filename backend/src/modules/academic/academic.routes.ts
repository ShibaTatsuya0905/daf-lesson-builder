import { Router } from 'express';
import { AcademicController } from './academic.controller';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new AcademicController();

router.use(authenticateToken);

router.get('/admin/classes', requireRole(['ADMIN']), controller.getAdminClasses);
router.post('/admin/classes', requireRole(['ADMIN']), controller.createClass);
router.put('/admin/classes/:id', requireRole(['ADMIN']), controller.updateClass);
router.delete('/admin/classes/:id', requireRole(['ADMIN']), controller.deleteClass);

router.get('/admin/students', requireRole(['ADMIN']), controller.getAllStudents);
router.post('/admin/students', requireRole(['ADMIN']), controller.addStudent);
router.post('/admin/students/batch', requireRole(['ADMIN']), controller.batchAddStudents);
router.delete('/admin/students/:id', requireRole(['ADMIN']), controller.deleteStudent);

router.get('/admin/schedules', requireRole(['ADMIN']), controller.getAdminSchedules);
router.post('/admin/schedules', requireRole(['ADMIN']), controller.createSchedule);
router.delete('/admin/schedules/:id', requireRole(['ADMIN']), controller.deleteSchedule);

router.get('/teacher/classes', controller.getTeacherClasses);
router.get('/teacher/schedules', controller.getTeacherSchedules);
router.post('/teacher/evaluations', controller.saveEvaluation);

export default router;