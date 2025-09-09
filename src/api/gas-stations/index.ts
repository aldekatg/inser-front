import { api } from "@/api"
import { Response } from "@/types.ts"
import {
  GasStationPayload,
  GasStationResponse,
  GasStationType,
} from "@/api/gas-stations/types.ts"

const URLS = {
  getGasStations: "/gas-stations",
}

export const fetchGasStations = async () =>
  api
    .get<Response<GasStationResponse>>(URLS.getGasStations)
    .then((resp) => resp.data)

export const createGasStation = async (body: GasStationPayload) =>
  api
    .post<Response<GasStationType>>(URLS.getGasStations, body)
    .then((resp) => resp.data)

export const updateGasStation = async (id: number, body: GasStationPayload) =>
  api
    .patch<Response<GasStationType>>(URLS.getGasStations + `/${id}`, body)
    .then((resp) => resp.data)

export const deleteGasStation = async (id: number) =>
  api
    .delete<Response<any>>(URLS.getGasStations + `/${id}`)
    .then((resp) => resp.data)
