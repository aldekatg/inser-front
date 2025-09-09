import { api } from "@/api"
import { Response } from "@/types.ts"
import { CompaniesResponse, CompanyType } from "@/api/gas-stations/types.ts"

const URLS = {
  getCompanies: "/companies",
  getRegion: "/regions",
}

export const fetchCompanies = async () =>
  api
    .get<Response<CompaniesResponse>>(URLS.getCompanies)
    .then((resp) => resp.data)

export const fetchRegions = async () =>
  api.get<Response<any>>(URLS.getRegion).then((resp) => resp.data)

export const createCompany = async (body: CompanyType) =>
  api
    .post<Response<CompaniesResponse>>(URLS.getCompanies, body)
    .then((resp) => resp.data)

export const updateCompanies = async (id: number, body: CompanyType) =>
  api
    .patch<Response<CompaniesResponse>>(URLS.getCompanies + `/${id}`, body)
    .then((resp) => resp.data)
