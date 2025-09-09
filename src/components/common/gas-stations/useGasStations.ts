import { ref } from "vue"
import { PaginationType } from "@/types.ts"
import { fetchGasStations } from "@/api/gas-stations"
import { GasStationType } from "@/api/gas-stations/types.ts"

export function useGasStations() {
  const loading = ref<boolean>(false)
  const gasStations = ref<GasStationType[]>()
  const gasStationForm = ref<GasStationType>({
    object_number: "",
    address: "",
    region_id: null,
    operator_name: "",
    email: "",
    company_id: null,
  })
  const pagination = ref<PaginationType>({
    total: 0,
    page: 0,
    per_page: 0,
    has_next: true,
    has_prev: true,
  })

  async function initGasStations() {
    loading.value = true
    try {
      const response = await fetchGasStations()

      if (response.status === "error") throw new Error(response.message || "")

      gasStations.value = response.payload.items
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  return {
    initGasStations,
    setGasStationForm: (data: GasStationType) => {
      gasStationForm.value = data
    },
    gasStationForm,
    gasStations,
    pagination,
  }
}
