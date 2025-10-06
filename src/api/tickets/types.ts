import { EmployeeResponse } from "@/api/employees/types.ts"
import { ChecklistType, GasStationType } from "@/api/gas-stations/types.ts"
import { PaginationType } from "@/types.ts"
import { WorkType } from "@/api/tariffs/types.ts"

export interface TicketsResponse extends PaginationType {
  items: TicketDetails[]
}

export interface TicketDetails {
  gas_station_id: number
  status: string
  criticality: string
  ticket_type: string
  ticket_number: string | null
  submitted_at: string
  technical_tasks_preview: string[]
  technical_tasks_details: TechnicalTaskDetail[]
  content: string
  employee_id: number
  materials: Record<string, any>
  id: number
  guid: string
  comment: string
  service_sheet_number: number | null
  diagnostic_result: string
  created_at: string
  updated_at: string
  planned_finish_at: string
  closed_at: string
  work_started_at: string
  work_finished_at: string
  work_result: string
  gas_station: GasStationType
  employee: EmployeeResponse
  status_changed_at: string
  approval_wait_started_at: string
  approval_wait_total_seconds: number
  closed_via_qr_at: string
  escalation_timeout_minutes: number
  escalation_due_at: string
  is_sla_80_elapsed?: boolean
}

export interface TicketCreatePayload {
  gas_station_id: number | null
  status: string
  criticality: string
  ticket_type: string
  ticket_number: string | null
  submitted_at: string | number | Date
  technical_tasks_preview: string[]
  technical_tasks_details: TechnicalTaskDetail[]
  content: string
  employee_id: number | null
  employee: EmployeeResponse | null
  service_sheet_number: number | null
  comment: string | null
  diagnostic_result: string | null
  work_result: string | null
  work_started_at?: string | number | Date
  work_finished_at?: string | number | Date
  materials: Record<string, any>
}

export interface TicketUpdatePayload {
  gas_station_id: number | null
  status: string
  criticality: string
  ticket_type: string
  submitted_at: string | number | Date
  planned_finish_at: string
  closed_at: string | null
  technical_tasks_preview: string[]
  technical_tasks_details: TechnicalTaskDetail[]
  content: string
  employee_id: number | null
  employee: EmployeeResponse | null
  comment: string | null
  service_sheet_number: number | null
  ticket_number: string | null
  diagnostic_result: string | null
  work_started_at: string | number | Date
  work_finished_at: string | number | Date
  work_result: string | null
  materials: Record<string, any>
  id: number | null
  guid: string
  created_at: string | number | Date
  updated_at: string | number | Date
  escalation_timeout_minutes: number
  escalation_due_at: string | number | Date
}

export interface TechnicalTaskDetail {
  code: string
  equipment?: any
  description: string
  id: number | null
  work_types: WorkType[]
  checklists?: ChecklistType[]
}

export interface MaterialResponse {
  nomenclature_name: string
  nomenclature_guid: string
  quantity: number
}
