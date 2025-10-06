export const TICKET_TYPES = {
  CUSTOMER_CALL: "customer_call",
  PLANNED: "planned",
} as const

export const TICKET_STATUSES = {
  NEW: "new",
  IN_PROGRESS: "in_progress",
  AWAITING_APPROVAL: "awaiting_approval",
  DONE_CHECKED: "done_checked",
  DONE_UNCHECKED: "done_unchecked",
  REJECTED_BY_CUSTOMER: "rejected_by_customer",
} as const

export const TICKET_CRITICALITY = {
  CRITICAL: "critical",
  SERIOUS: "serious",
  SIGNIFICANT: "significant",
  MINOR: "minor",
  SERVICE_REQUEST: "service_request",
  PLANNED_MAINTENANCE: "planned_maintenance",
} as const

export const PAGINATION_SIZES = [10, 20, 50, 100] as const

export const DEFAULT_PAGINATION = {
  page: 1,
  per_page: 10,
  total: 0,
  has_next: false,
  has_prev: false,
} as const

export type TicketType = (typeof TICKET_TYPES)[keyof typeof TICKET_TYPES]
export type TicketStatus =
  (typeof TICKET_STATUSES)[keyof typeof TICKET_STATUSES]
export type TicketCriticality =
  (typeof TICKET_CRITICALITY)[keyof typeof TICKET_CRITICALITY]
export type PaginationSize = (typeof PAGINATION_SIZES)[number]
