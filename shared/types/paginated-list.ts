export interface PaginatedList<T> {
  items: T[]
  totalItems: number
  page: number
  pageSize: number
}
