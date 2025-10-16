import { defineStore } from "pinia"
import {
  CompanyType,
  RegionType,
  WarehouseType,
  GasStationType,
} from "@/api/gas-stations/types.ts"
import { EmployeeResponse } from "@/api/employees/types.ts"
import { fetchCompanies, fetchRegions, fetchWarehouses } from "@/api/dictionary"
import { fetchGasStations } from "@/api/gas-stations"
import { fetchEmployees } from "@/api/employees"
import { fetchTechnicalTasks } from "@/api/tariffs"
import { TechnicalTaskDetail } from "@/api/tickets/types.ts"

interface DictionaryState {
  companies: CompanyType[] | null
  regions: RegionType[] | null
  warehouses: WarehouseType[] | null
  gas_stations: GasStationType[] | null
  employees: EmployeeResponse[] | null
  technical_tasks: TechnicalTaskDetail[] | null
  isLoading: boolean
  isLoaded: boolean
}

export const useDictionaryStore = defineStore("dictionaryStore", {
  state: (): DictionaryState => ({
    companies: null,
    regions: null,
    warehouses: null,
    gas_stations: null,
    employees: null,
    technical_tasks: null,
    isLoading: false,
    isLoaded: false,
  }),
  getters: {
    isCompanies: (state: DictionaryState) => state.companies,
    isRegions: (state: DictionaryState) => state.regions,
    isWarehouses: (state: DictionaryState) => state.warehouses,
    isGasStations: (state: DictionaryState) => state.gas_stations,
    isEmployees: (state: DictionaryState) => state.employees,
    isTechTasks: (state: DictionaryState) => state.technical_tasks,
  },
  actions: {
    async initDictionary() {
      console.log("[Dictionary] Начало загрузки справочников...")
      this.isLoading = true
      try {
        const [
          companiesResponse,
          regionsResponse,
          warehousesResponse,
          gasStationsResponse,
          employeesResponse,
          technicalTasksResponse,
        ] = await Promise.all([
          fetchCompanies(),
          fetchRegions(),
          fetchWarehouses(),
          fetchGasStations(),
          fetchEmployees(),
          fetchTechnicalTasks(),
        ])
        if (
          companiesResponse.status === "error" ||
          regionsResponse.status === "error" ||
          warehousesResponse.status === "error" ||
          gasStationsResponse.status === "error" ||
          employeesResponse.status === "error" ||
          technicalTasksResponse.status === "error"
        ) {
          throw new Error(
            companiesResponse.message ||
              regionsResponse.message ||
              warehousesResponse.message ||
              gasStationsResponse.message ||
              employeesResponse.message ||
              technicalTasksResponse.message ||
              "Unknown error"
          )
        }
        this.companies = companiesResponse.payload.items
        this.regions = regionsResponse.payload.items
        this.warehouses = warehousesResponse.payload.items
        this.gas_stations = gasStationsResponse.payload.items
        this.employees = employeesResponse.payload.items
        this.technical_tasks = technicalTasksResponse.payload.items
        this.isLoaded = true
        console.log("[Dictionary] Справочники успешно загружены")
      } catch (e) {
        console.error("[Dictionary] Ошибка загрузки справочников:", e)
      } finally {
        this.isLoading = false
      }
    },

    // Геттеры для опций в формате селектов
    getGasStationOptions() {
      if (!this.gas_stations) return []
      return this.gas_stations.map((station) => ({
        label: `${station.object_number}, ${station.company?.name}, ${station.region?.name}`,
        value: station.id!,
      }))
    },

    getEmployeeOptions() {
      if (!this.employees) return []
      return this.employees.map((employee) => ({
        label: employee.full_name,
        value: employee.id,
      }))
    },
  },
})
