import { fetchGasStations } from "@/api/gas-stations"
import { ref } from "vue"
import { GasStationType } from "@/api/gas-stations/types.ts"
import { EmployeeResponse } from "@/api/employees/types.ts"
import { fetchEmployees } from "@/api/employees"

export function useAdditionalRequests() {
  const message = useMessage()

  const optionsOfGasStations = ref<GasStationType[]>([])
  const optionsOfEmployee = ref<EmployeeResponse[]>([])
  const customLoading = reactive({
    gasStationLoading: false,
    employeeLoading: false,
  })

  async function getGasStations() {
    customLoading.gasStationLoading = true
    try {
      if (optionsOfGasStations.value.length) return
      const response = await fetchGasStations()
      if (response.status === "error") {
        message.error(response.message || "Ошибка при загрузке АЗС")
        return []
      }
      optionsOfGasStations.value = response.payload.items
    } catch (e) {
      console.error("Error in getGasStations:", e)
    } finally {
      customLoading.gasStationLoading = false
    }
  }

  const getEmployee = async () => {
    try {
      customLoading.employeeLoading = true
      if (optionsOfEmployee.value.length) return
      const response = await fetchEmployees()
      if (response.status === "error") {
        throw new Error("Ошибка при загрузке сотрудников")
      }
      optionsOfEmployee.value = response.payload.items
    } catch (error) {
      console.error("Не удалось загрузить сотрудников:", error)
    } finally {
      customLoading.employeeLoading = false
    }
  }

  return {
    customLoading,
    getGasStations,
    optionsOfGasStations,
    optionsOfEmployee,
    getEmployee,
  }
}
