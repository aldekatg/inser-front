import { api, objectToUrlParams } from "@/api"
import { Response, SortedFieldsType } from "@/types.ts"
import {
  EmployeePayload,
  EmployeeResponse,
  EmployeeResponseWithPage,
} from "@/api/employees/types.ts"

const URLS = {
  getEmployees: "/employees",
}

// Companies
export const fetchEmployees = async (sortedFields: SortedFieldsType) =>
  api
    .get<
      Response<EmployeeResponseWithPage>
    >(URLS.getEmployees + objectToUrlParams(sortedFields))
    .then((resp) => resp.data)

export const createEmployee = async (body: EmployeePayload) =>
  api
    .post<Response<EmployeeResponse>>(URLS.getEmployees, body)
    .then((resp) => resp.data)

export const updateEmployee = async (id: number, body: EmployeePayload) =>
  api
    .patch<Response<EmployeeResponse>>(URLS.getEmployees + `/${id}`, body)
    .then((resp) => resp.data)

export const deleteEmployee = async (id: number) =>
  api
    .delete<Response<any>>(URLS.getEmployees + `/${id}`)
    .then((resp) => resp.data)
