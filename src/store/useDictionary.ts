import { defineStore } from "pinia"
import {
  CompanyType,
  RegionType,
  WarehouseType,
} from "@/api/gas-stations/types.ts"
import { fetchCompanies, fetchRegions, fetchWarehouses } from "@/api/dictionary"
import { fetchTechnicalTasks } from "@/api/tariffs"
import { TechnicalTaskDetail } from "@/api/tickets/types.ts"

interface DictionaryState {
  companies: CompanyType[] | null
  regions: RegionType[] | null
  warehouses: WarehouseType[] | null
  technical_tasks: TechnicalTaskDetail[] | null
}

export const useDictionaryStore = defineStore("dictionaryStore", {
  state: (): DictionaryState => ({
    companies: null,
    regions: null,
    warehouses: null,
    technical_tasks: null,
  }),
  getters: {
    isCompanies: (state: DictionaryState) => state.companies,
    isRegions: (state: DictionaryState) => state.regions,
    isWarehouses: (state: DictionaryState) => state.warehouses,
    isTechTasks: (state: DictionaryState) => state.technical_tasks,
  },
  actions: {
    async initDictionary() {
      try {
        const [
          companiesResponse,
          regionsResponse,
          warehousesResponse,
          technicalTasksResponse,
        ] = await Promise.all([
          fetchCompanies(),
          fetchRegions(),
          fetchWarehouses(),
          fetchTechnicalTasks(),
        ])
        if (
          companiesResponse.status === "error" ||
          regionsResponse.status === "error" ||
          warehousesResponse.status === "error" ||
          technicalTasksResponse.status === "error"
        ) {
          throw new Error(
            companiesResponse.message ||
              regionsResponse.message ||
              warehousesResponse.message ||
              technicalTasksResponse.message ||
              "Unknown error"
          )
        }
        this.companies = companiesResponse.payload.items
        this.regions = regionsResponse.payload.items
        this.warehouses = warehousesResponse.payload.items
        this.technical_tasks = technicalTasksResponse.payload.items
      } catch (e) {
        console.error("Error fetching:", e)
      }
    },
  },
})
