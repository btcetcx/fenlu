export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PageInfo {
  pageNo: number;
  pageSize: number;
  total: number;
  pages: number;
}

export interface PageResult<T> {
  items: T[];
  page: PageInfo;
}

export interface ListQuery {
  pageNo?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  customerId?: string;
  ownerId?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type ApiMode = 'mock' | 'remote';
