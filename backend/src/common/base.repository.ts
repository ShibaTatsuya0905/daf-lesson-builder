export class BaseRepository<T> {
  constructor(protected readonly model: any) {}

  async findMany(queryInfo: {
    search?: string;
    searchFields?: string[];
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, searchFields = ['title'], filter = {}, sort = '-createdAt', page = 1, limit = 10 } = queryInfo;

    const whereClause: any = { isDeleted: false, ...filter };

    if (search && searchFields.length > 0) {
      whereClause.OR = searchFields.map((field) => ({
        [field]: { contains: search },
      }));
    }

    const orderBy = sort.split(',').map((field) => {
      const isDesc = field.startsWith('-');
      return { [field.replace('-', '')]: isDesc ? 'desc' : 'asc' };
    });

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({ where: whereClause, orderBy, skip, take: limit }),
      this.model.count({ where: whereClause }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return this.model.findFirst({ where: { id, isDeleted: false } });
  }

  async create(data: any) {
    return this.model.create({ data });
  }

  async update(id: string, data: any) {
    return this.model.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.model.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}