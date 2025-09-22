export interface PaginationType {
  total: number
  page: number
  per_page: number
  has_next: boolean
  has_prev: boolean
}

export interface SortedFieldsType {
  order_by: string
  desc: boolean
  limit: number
  skip: number
}

export interface Response<T> {
  status: "success" | "error"
  message: string | null
  payload: T
}
