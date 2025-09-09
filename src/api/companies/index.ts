import { api } from "@/api"
import { Response } from "@/types.ts"
import { CompaniesPayload } from "@/api/gas-stations/types.ts"

const URLS = {
  getCompanies: "/companies",
  getRegion: "/regions",
}

export const fetchCompanies = async () =>
  api
    .get<Response<CompaniesPayload>>(URLS.getCompanies)
    .then((resp) => resp.data)

export const fetchRegions = async () =>
  api.get<Response<any>>(URLS.getRegion).then((resp) => resp.data)
