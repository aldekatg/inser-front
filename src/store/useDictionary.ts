import { defineStore } from "pinia"
import {
  CompanyType,
  RegionType,
  WarehouseType,
} from "@/api/gas-stations/types.ts"
import { fetchCompanies, fetchRegions, fetchWarehouses } from "@/api/dictionary"

interface DictionaryState {
  companies: CompanyType[] | null
  regions: RegionType[] | null
  warehouses: WarehouseType[] | null
}

export const useDictionaryStore = defineStore("dictionaryStore", {
  state: (): DictionaryState => ({
    companies: null,
    regions: null,
    warehouses: null,
  }),
  getters: {
    isCompanies: (state: DictionaryState) => state.companies,
    isRegions: (state: DictionaryState) => state.regions,
    isWarehouses: (state: DictionaryState) => state.warehouses,
  },
  actions: {
    async initDictionary() {
      try {
        const [companiesResponse, regionsResponse, warehousesResponse] =
          await Promise.all([
            fetchCompanies(),
            fetchRegions(),
            fetchWarehouses(),
          ])
        if (
          companiesResponse.status === "error" ||
          regionsResponse.status === "error" ||
          warehousesResponse.status === "error"
        ) {
          throw new Error(
            companiesResponse.message ||
              regionsResponse.message ||
              warehousesResponse.message ||
              "Unknown error"
          )
        }
        this.companies = companiesResponse.payload.items
        this.regions = regionsResponse.payload.items
        this.warehouses = warehousesResponse.payload.items
      } catch (e) {
        console.error("Error fetching:", e)
      }
    },
  },
})
