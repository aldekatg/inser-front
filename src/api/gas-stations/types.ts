import { PaginationType } from "@/types.ts"

export interface GasStationResponse extends PaginationType {
  items: GasStationType[]
}
export interface GasStationPayload {
  object_number: string
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

export interface TechnicalTasksType {
  code: string
  description: string
  id: number | null
  work_types: number[]
}

export interface RegionType {
  id?: number
  name: string
}
