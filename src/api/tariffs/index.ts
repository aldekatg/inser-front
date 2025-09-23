import { Response, SortedFieldsType } from "@/types.ts"
import { api, objectToUrlParams } from "@/api"
import {
  TechnicalTasksTypeResponse,
  WorkType,
  WorkTypeResponse,
} from "@/api/tariffs/types.ts"
import { TechnicalTasksType } from "@/api/gas-stations/types.ts"

const URLS = {
  getWorkTypes: "/work-types",
  getTechnicalTasks: "/technical-tasks",
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
    .delete<Response<TechnicalTasksType>>(URLS.getTechnicalTasks + `/${id}`)
    .then((resp) => resp.data)

export const createTechnicalTask = async (body: TechnicalTasksType) =>
  api
    .post<Response<TechnicalTasksType>>(URLS.getTechnicalTasks, body)
    .then((resp) => resp.data)

export const updateTechnicalTask = async (
  id: number,
  body: TechnicalTasksType
) =>
  api
    .patch<
      Response<TechnicalTasksType>
    >(URLS.getTechnicalTasks + `/${id}`, body)
    .then((resp) => resp.data)
