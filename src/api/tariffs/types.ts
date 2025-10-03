import { PaginationType } from "@/types.ts"
import { TechnicalTaskDetail } from "@/api/tickets/types.ts"

export interface WorkType {
  code: string
  description: string
  id: number | null
  technical_task_id: number | null
}

export interface WorkTypeResponse extends PaginationType {
  items: WorkType[]
}

export interface TechnicalTasksTypeResponse extends PaginationType {
  items: TechnicalTaskDetail[]
}
