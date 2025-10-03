import { Response, SortedFieldsType } from "@/types.ts"
import { api, objectToUrlParams } from "@/api"
import {
  TechnicalTasksTypeResponse,
  WorkType,
  WorkTypeResponse,
} from "@/api/tariffs/types.ts"
import {
  ChecklistItemsPayload,
  ChecklistItemsType,
  ChecklistPayload,
  ChecklistType,
  ResponseWithPagination,
} from "@/api/gas-stations/types.ts"
import { TechnicalTaskDetail } from "@/api/tickets/types.ts"

const URLS = {
  getWorkTypes: "/work-types",
  getTechnicalTasks: "/technical-tasks",
  getChecklists: "/checklists",
  getChecklistItems: "/checklist-items",
}

// Work Types
export const fetchWorkTypes = async (sortedFields: SortedFieldsType) =>
  api
    .get<
      Response<WorkTypeResponse>
    >(URLS.getWorkTypes + objectToUrlParams(sortedFields))
    .then((resp) => resp.data)

export const deleteWorkType = async (id: number) =>
  api
    .delete<Response<WorkTypeResponse>>(URLS.getWorkTypes + `/${id}`)
    .then((resp) => resp.data)

export const createWorkType = async (body: WorkType) =>
  api
    .post<Response<WorkType>>(URLS.getWorkTypes, body)
    .then((resp) => resp.data)

export const updateWorkType = async (id: number, body: WorkType) =>
  api
    .patch<Response<WorkType>>(URLS.getWorkTypes + `/${id}`, body)
    .then((resp) => resp.data)

// Technical Tasks
export const fetchTechnicalTasks = async (sortedFields?: SortedFieldsType) =>
  api
    .get<
      Response<TechnicalTasksTypeResponse>
    >(URLS.getTechnicalTasks + objectToUrlParams(sortedFields || {}))
    .then((resp) => resp.data)

export const deleteTechnicalTask = async (id: number) =>
  api
    .delete<Response<TechnicalTaskDetail>>(URLS.getTechnicalTasks + `/${id}`)
    .then((resp) => resp.data)

export const createTechnicalTask = async (body: TechnicalTaskDetail) =>
  api
    .post<Response<TechnicalTaskDetail>>(URLS.getTechnicalTasks, body)
    .then((resp) => resp.data)

export const updateTechnicalTask = async (
  id: number,
  body: TechnicalTaskDetail
) =>
  api
    .patch<
      Response<TechnicalTaskDetail>
    >(URLS.getTechnicalTasks + `/${id}`, body)
    .then((resp) => resp.data)

// Checklists
export const fetchChecklists = async (sortedFields?: SortedFieldsType) =>
  api
    .get<
      Response<ResponseWithPagination<ChecklistType[]>>
    >(URLS.getChecklists + objectToUrlParams(sortedFields || {}))
    .then((resp) => resp.data)

export const fetchChecklistItems = async (sortedFields?: SortedFieldsType) =>
  api
    .get<
      Response<ResponseWithPagination<ChecklistItemsType[]>>
    >(URLS.getChecklistItems + objectToUrlParams(sortedFields || {}))
    .then((resp) => resp.data)

export const deleteChecklist = async (id: number) =>
  api
    .delete<Response<any>>(URLS.getChecklists + `/${id}`)
    .then((resp) => resp.data)

export const deleteChecklistItems = async (id: number) =>
  api
    .delete<Response<any>>(URLS.getChecklistItems + `/${id}`)
    .then((resp) => resp.data)

export const createChecklistReq = async (body: ChecklistPayload) =>
  api
    .post<Response<ChecklistType>>(URLS.getChecklists, body)
    .then((resp) => resp.data)

export const createChecklistItemsReq = async (body: ChecklistItemsPayload) =>
  api
    .post<Response<ChecklistItemsType>>(URLS.getChecklistItems, body)
    .then((resp) => resp.data)

export const updateChecklistReq = async (body: ChecklistPayload) =>
  api
    .patch<Response<ChecklistType>>(URLS.getChecklists + `/${body.id}`, body)
    .then((resp) => resp.data)

export const updateChecklistItemsReq = async (body: ChecklistItemsPayload) =>
  api
    .patch<
      Response<ChecklistItemsType>
    >(URLS.getChecklistItems + `/${body.id}`, body)
    .then((resp) => resp.data)
