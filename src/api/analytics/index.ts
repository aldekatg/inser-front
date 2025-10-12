import { api } from "@/api"
import type {
  TicketsReportResponse,
  WorkHoursReportResponse,
  SlaReportResponse,
} from "./types"

export const getTicketsReport = async (
  dateFrom: string,
  dateTo: string
): Promise<TicketsReportResponse> => {
  const response = await api.get<TicketsReportResponse>(
    `/analytics/tickets-report`,
    {
      params: {
        date_from: dateFrom,
        date_to: dateTo,
      },
    }
  )
  return response.data
}

export const getWorkHoursReport = async (
  dateFrom: string,
  dateTo: string
): Promise<WorkHoursReportResponse> => {
  const response = await api.get<WorkHoursReportResponse>(
    `/analytics/work-hours`,
    {
      params: {
        date_from: dateFrom,
        date_to: dateTo,
      },
    }
  )
  return response.data
}

export const getSlaReport = async (
  dateFrom: string,
  dateTo: string
): Promise<SlaReportResponse> => {
  const response = await api.get<SlaReportResponse>(`/analytics/sla`, {
    params: {
      date_from: dateFrom,
      date_to: dateTo,
    },
  })
  return response.data
}
