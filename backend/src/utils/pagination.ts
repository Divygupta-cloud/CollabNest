export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  order: 'asc' | 'desc';
  sortOrder?: 'asc' | 'desc';
}

export function getPaginationOptions(query: Record<string, any>, defaultSortBy = 'createdAt'): PaginationOptions {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const requestedLimit = parseInt(query.limit as string, 10) || 20;
  const limit = Math.min(100, Math.max(1, requestedLimit));
  const skip = (page - 1) * limit;
  const sortBy = (query.sortBy as string) || defaultSortBy;
  const order = query.order === 'asc' || query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, sortBy, order, sortOrder: order };
}

export const parsePaginationParams = getPaginationOptions;

