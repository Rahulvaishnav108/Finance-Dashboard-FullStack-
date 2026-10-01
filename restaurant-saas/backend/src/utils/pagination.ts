// src/utils/pagination.ts
// Pagination helpers for list endpoints

import { PaginationMeta } from '../types/api.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Parse pagination params from query string.
 * Clamps values to safe defaults.
 */
export function parsePagination(query: { page?: string; limit?: string }): ParsedPagination {
  let page = parseInt(query.page || '', 10);
  let limit = parseInt(query.limit || '', 10);

  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build pagination metadata for response.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
