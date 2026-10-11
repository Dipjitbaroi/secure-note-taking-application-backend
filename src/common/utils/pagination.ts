import { z } from 'zod';

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuery>;

export function getSkip({ page, limit }: PaginationQuery) {
  return (page - 1) * limit;
}

export function paginated<T>(items: T[], total: number, { page, limit }: PaginationQuery) {
  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
