import { PaginationType } from "@/types.ts"

export interface EmployeePayload {
  iin: string
  phone: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  region_id?: number
  warehouse_id?: number
  parent_id?: number
  password: string
  id?: number | null
}

export interface EmployeeResponse {
  iin: string
  phone: string
  email: string
  full_name: string
  role: string
  is_active: true
  region_id: number
  warehouse_id: number
  parent_id: number
  id: number
  region: {
    id: number
    name: string
  }
  warehouse: {
    id: number
    name: string
    guid: string
    responsible_iin: string
  }
}

export type EmployeeResponseWithPage = PaginationType & {
  items: EmployeeResponse[]
}
