import { api } from "@/api"
import { Response } from "@/types.ts"
import { GasStationPayload } from "@/api/gas-stations/types.ts"

const URLS = {
  getGasStations: "/gas-stations",
}

export const fetchGasStations = async () =>
  api
    .get<Response<GasStationPayload>>(URLS.getGasStations)
    .then((resp) => resp.data)
