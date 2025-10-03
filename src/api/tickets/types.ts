import { EmployeeResponse } from "@/api/employees/types.ts"
import { GasStationType } from "@/api/gas-stations/types.ts"
import { PaginationType } from "@/types.ts"

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
  service_sheet_number: string
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
  materials: Record<string, any>
}

export interface TicketUpdatePayload {
  gas_station_id: number
  status: string
  criticality: string
  ticket_type: string
  submitted_at: string
  planned_finish_at: string
  closed_at: string
  technical_tasks_preview: string[]
  technical_tasks_details: TechnicalTaskDetail[]
  content: string
  employee_id: number
  comment: string
  service_sheet_number: string
  ticket_number: string
  diagnostic_result: string
  work_started_at: string
  work_finished_at: string
  work_result: string
  materials: Record<string, any>
}

export interface TechnicalTaskDetail {
  code: string
  equipment: string
  description: string
  id: number | null
  work_types: {
    code: string
    description: string
    id: number | null
    technical_task_id: number | null
  }[]
  checklists: {
    technical_task_id: number | null
    description: string
    id: number | null
    items: any[]
  }[]
}
