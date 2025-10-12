export interface TicketReportItem {
  ticket_number: string
  region_name: string
  gas_station_number: string
  status: string
  criticality: string
  submitted_at: string
  closed_at: string | null
  technical_tasks_preview: string[] | null
  content: string | null
  employee_name: string | null
  service_sheet_number: number | null
  sl_level: number
  comment: string | null
}

export interface TicketsReportResponse {
  payload: {
    payload: TicketReportItem[]
    count: number
  }
  count: number
}

export interface WorkHoursTicket {
  work_started_at: string
  work_finished_at: string
  duration_hours: number
  gas_station: {
    object_number: string
    address: string
  }
  service_sheet_number: number | null
  work_result: string | null
}

export interface WorkHoursDay {
  date: string
  day_total: number
  tickets: WorkHoursTicket[]
}

export interface WorkHoursEmployee {
  employee: {
    id: number
    full_name: string
    iin: string
  }
  totals: {
    total_hours: number
    days_worked: number
  }
  days: WorkHoursDay[]
}

export interface WorkHoursReportResponse {
  period: {
    from: string
    to: string
  }
  employees: WorkHoursEmployee[]
  totals: {
    total_hours: number
    days_worked: number
  }
}

export interface SlaReportResponse {
  period: {
    from: string
    to: string
  }
  totals: {
    all: number
    unclosed: number
    completed_customer_call: number
    uncompleted_customer_call: number
    completed_customer_call_sla: number
    completed_planned: number
    completed_planned_sla: number
  }
  avg_duration_hours: {
    planned_maintenance?: {
      sl1?: number
      sl2?: number
      sl3?: number
    }
    serious?: {
      sl1?: number
      sl2?: number
      sl3?: number
    }
    significant?: {
      sl1?: number
      sl2?: number
      sl3?: number
    }
    critical?: {
      sl1?: number
      sl2?: number
      sl3?: number
    }
    minor?: {
      sl1?: number
      sl2?: number
      sl3?: number
    }
  }
  sla_percent: {
    planned?: {
      sl1?: number
      sl2?: number
      sl3?: number
    }
    customer_call?: {
      sl1?: number
      sl2?: number
      sl3?: number
    }
    overall?: {
      sl1?: number
      sl2?: number
      sl3?: number
    }
  }
  meta: {
    generated_at: string
    timezone: string
  }
}
