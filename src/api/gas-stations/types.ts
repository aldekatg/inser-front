import { PaginationType } from "@/types.ts"

export interface ResponseWithPagination<T> extends PaginationType {
  items: T
}

export interface GasStationPayload {
  object_number: string
  guid?: string
  address: string
  region_id: number | null
  operator_name: string
  email: string
  id: number | null
  company_id: number | null
  password: string | null
}

export interface GasStationType {
  object_number: string
  address: string
  region_id: number | null
  operator_name: string
  guid: string
  email: string
  company_id: number | null
  id: number | null
  sl_level: number | null
  company?: {
    bin: string
    name: string
    id: number
  }
  region?: {
    id: number
    name: string
  }
}

export interface CompaniesResponse extends PaginationType {
  items: CompanyType[]
}

export interface CompanyType {
  id?: number
  name: string
  bin: string
}

export interface WarehouseType {
  id?: number
  name: string
  responsible_iin: string
}

export interface RegionType {
  id?: number
  name: string
}

export interface ChecklistType {
  technical_task_id: number
  description: string
  id: number
  items: ChecklistItemsType[]
}

export interface ChecklistPayload {
  technical_task_id: number | null
  description: string
  id: number | null
}

export interface ChecklistItemsPayload {
  checklist_id: number | null
  code: string
  description: string
  id: number | null
}

export interface ChecklistItemsType {
  code: string
  checklist_id: number
  description: string
  id: number
}
