import { PaginationType } from "@/types.ts"

export interface GasStationPayload extends PaginationType {
  items: GasStationType[]
}

export interface GasStationType {
  object_number: string
  address: string
  region_id: number | null
  operator_name: string
  email: string
  company_id: number | null
  id?: number
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

export interface CompaniesPayload extends PaginationType {
  items: CompanyType[]
}

export interface CompanyType {
  id: number
  name: string
  bin: string
}

export interface RegionType {
  id: number
  name: string
}
