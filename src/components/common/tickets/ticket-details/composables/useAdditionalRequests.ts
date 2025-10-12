import { useDictionaryStore } from "@/store/useDictionary.ts"
import { storeToRefs } from "pinia"
import { computed } from "vue"

// Глобальное состояние для предотвращения дублирования запросов
const loadingState = reactive({
  gasStationLoading: false,
  employeeLoading: false,
})

export function useAdditionalRequests() {
  const dictionaryStore = useDictionaryStore()
  const { gas_stations, employees } = storeToRefs(dictionaryStore)

  const optionsOfGasStations = computed(() => {
    if (!gas_stations.value) return []
    return gas_stations.value.map((station) => ({
      label: `${station.object_number}, ${station.company?.name}, ${station.region?.name}`,
      value: station.id!,
    }))
  })

  const optionsOfEmployee = computed(() => {
    return employees.value || []
  })

  async function getGasStations() {
    // Если уже загружено или загружается - не делаем запрос
    if (gas_stations.value?.length || loadingState.gasStationLoading) return

    loadingState.gasStationLoading = true
    try {
      await dictionaryStore.initDictionary()
    } finally {
      loadingState.gasStationLoading = false
    }
  }

  const getEmployee = async () => {
    // Если уже загружено или загружается - не делаем запрос
    if (employees.value?.length || loadingState.employeeLoading) return

    loadingState.employeeLoading = true
    try {
      await dictionaryStore.initDictionary()
    } finally {
      loadingState.employeeLoading = false
    }
  }

  return {
    customLoading: loadingState,
    getGasStations,
    optionsOfGasStations,
    optionsOfEmployee,
    getEmployee,
  }
}
