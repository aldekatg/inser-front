import { defineStore } from "pinia"
import { CompanyType, RegionType } from "@/api/gas-stations/types.ts"
import { fetchCompanies, fetchRegions } from "@/api/companies"

interface DictionaryState {
  companies: CompanyType[] | null
  regions: RegionType[] | null
}

export const useDictionaryStore = defineStore("dictionaryStore", {
  state: (): DictionaryState => ({
    companies: null,
    regions: null,
  }),
  getters: {
    isCompanies: (state: DictionaryState) => state.companies,
    isRegions: (state: DictionaryState) => state.regions,
  },
  actions: {
    async initDictionary() {
      try {
        const [companiesResponse, regionsResponse] = await Promise.all([
          fetchCompanies(),
          fetchRegions(),
        ])
        if (
          companiesResponse.status === "error" ||
          regionsResponse.status === "error"
        ) {
          throw new Error(
            companiesResponse.message || regionsResponse.message || ""
          )
        }
        this.companies = companiesResponse.payload.items
        this.regions = regionsResponse.payload.items
      } catch (e) {
        console.error("Error fetching companies:", e)
      }
    },
  },
})
