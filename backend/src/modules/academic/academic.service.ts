import prisma from '../../common/prisma';

export class AcademicService {
  async getAdminClasses() {
    return prisma.class.findMany({
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        students: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createClass(data: { name: string; level: string; teacherId?: string }) {
    return prisma.class.create({
      data: {
        name: data.name,
        level: data.level,
        teacherId: data.teacherId || null,
      },
      include: { teacher: true },
    });
  }

  async updateClass(id: string, data: { name?: string; level?: string; teacherId?: string }) {
    return prisma.class.update({
      where: { id },
      data: {
        name: data.name,
        level: data.level,
        teacherId: data.teacherId || null,
      },
      include: { teacher: true },
    });
  }

  async deleteClass(id: string) {
    return prisma.class.delete({ where: { id } });
  }

  async getAllStudents() {
    return prisma.student.findMany({
      include: {
        class: true,
        evaluations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addStudent(data: { name: string; email?: string; phone?: string; classId: string }) {
    return prisma.student.create({ data });
  }

  async batchAddStudents(students: Array<{ name: string; email?: string; phone?: string; classId: string }>) {
    return prisma.student.createMany({
      data: students.map((s) => ({
        name: s.name,
        email: s.email || null,
        phone: s.phone || null,
        classId: s.classId,
      })),
    });
  }

  async deleteStudent(id: string) {
    return prisma.student.delete({ where: { id } });
  }

  async getAdminSchedules() {
    return prisma.schedule.findMany({
      include: {
        class: true,
        teacher: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSchedule(data: { classId: string; teacherId: string; dayOfWeek: string; startTime: string; endTime: string; room?: string }) {
    return prisma.schedule.create({
      data,
      include: {
        class: true,
        teacher: true,
      },
    });
  }

  async deleteSchedule(id: string) {
    return prisma.schedule.delete({ where: { id } });
  }

  async getTeacherClasses(teacherId: string) {
    return prisma.class.findMany({
      where: { teacherId },
      include: {
        students: {
          include: {
            evaluations: {
              where: { teacherId },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getTeacherSchedules(teacherId: string) {
    return prisma.schedule.findMany({
      where: { teacherId },
      include: { class: true },
      orderBy: { startTime: 'asc' },
    });
  }

  async saveEvaluation(data: { studentId: string; teacherId: string; rating?: string; feedback: string }) {
    const existing = await prisma.evaluation.findFirst({
      where: { studentId: data.studentId, teacherId: data.teacherId },
    });

    if (existing) {
      return prisma.evaluation.update({
        where: { id: existing.id },
        data: {
          rating: data.rating,
          feedback: data.feedback,
        },
      });
    }

    return prisma.evaluation.create({ data });
  }
}