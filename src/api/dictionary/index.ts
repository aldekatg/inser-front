import { api } from "@/api"
import { Response } from "@/types.ts"
import {
  CompaniesResponse,
  CompanyType,
  RegionType,
} from "@/api/gas-stations/types.ts"

const URLS = {
  getCompanies: "/companies",
  getRegion: "/regions",
}

// Companies
export const fetchCompanies = async () =>
  api
    .get<Response<CompaniesResponse>>(URLS.getCompanies)
    .then((resp) => resp.data)

export const createCompany = async (body: CompanyType) =>
  api
    .post<Response<CompaniesResponse>>(URLS.getCompanies, body)
    .then((resp) => resp.data)

export const updateCompanies = async (id: number, body: CompanyType) =>
  api
    .patch<Response<CompaniesResponse>>(URLS.getCompanies + `/${id}`, body)
    .then((resp) => resp.data)

export const deleteCompany = async (id: number) =>
  api
    .delete<Response<CompaniesResponse>>(URLS.getCompanies + `/${id}`)
    .then((resp) => resp.data)

// Regions
export const fetchRegions = async () =>
  api.get<Response<any>>(URLS.getRegion).then((resp) => resp.data)

export const createRegion = async (body: RegionType) =>
  api.post<Response<any>>(URLS.getRegion, body).then((resp) => resp.data)

export const updateRegion = async (id: number, body: RegionType) =>
  api
    .patch<Response<any>>(URLS.getRegion + `/${id}`, body)
    .then((resp) => resp.data)

export const deleteRegion = async (id: number) =>
  api.delete<Response<any>>(URLS.getRegion + `/${id}`).then((resp) => resp.data)
