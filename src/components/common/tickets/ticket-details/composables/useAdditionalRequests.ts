import { fetchGasStations } from "@/api/gas-stations"
import { ref } from "vue"
import { GasStationType } from "@/api/gas-stations/types.ts"
import { EmployeeResponse } from "@/api/employees/types.ts"
import { fetchEmployees } from "@/api/employees"

export function useAdditionalRequests() {
  const message = useMessage()

  const optionsOfGasStations = ref<GasStationType[]>([])
  const optionsOfEmployee = ref<EmployeeResponse[]>([])
  const selectLoading = ref(false)

  async function getGasStations() {
    selectLoading.value = true
    try {
      const response = await fetchGasStations()
      if (response.status === "error") {
        message.error(response.message || "Ошибка при загрузке АЗС")
        return []
      }
      optionsOfGasStations.value = response.payload.items
    } catch (e) {
      console.error("Error in getGasStations:", e)
    } finally {
      selectLoading.value = false
    }
  }

  const getEmployee = async () => {
    try {
      selectLoading.value = true
      const response = await fetchEmployees()
      if (response.status === "error") {
        throw new Error("Ошибка при загрузке сотрудников")
      }
      optionsOfEmployee.value = response.payload.items
    } catch (error) {
      console.error("Не удалось загрузить сотрудников:", error)
    } finally {
      selectLoading.value = false
    }
  }

  return {
    selectLoading,
    getGasStations,
    optionsOfGasStations,
    optionsOfEmployee,
    getEmployee,
  }
}
