export interface RowData {
  key: number
  name: string
  age: number
  address: string
  tags: string[]
}

export type MaterialItem = {
  nomenclature_name: string
  nomenclature_guid: string
  assignment_code: string
  quantity: number
}
export type TaskTab = { code: string; materials: MaterialItem[] }

export interface TicketFilters {
  q?: string
  ticket_type?: string
  statuses?: string[]
  status_group?: string
  gas_station_id?: number
  employee_id?: number
  guid?: string
  submitted_from?: string
  submitted_to?: string
  created_from?: string
  created_to?: string
  order_by?: string
  desc?: boolean
  limit?: number
  skip?: number
}
