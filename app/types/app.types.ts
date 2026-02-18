export type PaginateResult<T> = {
  data: Array<T>
  total: number
  pages: number
}

export type GetAllParams = {
  search?: string[]
  page?: number
  perPage?: number
  offset?: number
  limit?: number
  sort?: string
}
