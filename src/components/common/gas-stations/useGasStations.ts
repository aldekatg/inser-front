import { ref } from "vue"
import { useMessage } from "naive-ui"
import { PaginationType, SortedFieldsType } from "@/types.ts"
import {
  createGasStation,
  deleteGasStation,
  fetchGasStations,
  updateGasStation,
} from "@/api/gas-stations"
import { GasStationPayload, GasStationType } from "@/api/gas-stations/types.ts"
import {
  PencilSharp as PencilIcon,
  TrashOutline as TrashIcon,
} from "@vicons/ionicons5"
import { ActionButtons } from "@/utils"

export function useGasStations() {
  const message = useMessage()
  const loading = ref<boolean>(false)
  const gasStations = ref<GasStationType[]>()

  const isModalOpen = ref(false)

  const gasStationForm = ref<GasStationPayload>({
    object_number: "",
    address: "",
    guid: "",
    region_id: null,
    password: "",
    operator_name: "",
    email: "",
    id: null,
    company_id: null,
  })
  const pagination = ref<PaginationType>({
    total: 0,
    page: 0,
    per_page: 0,
    has_next: false,
    has_prev: false,
  })

  const sortedFields = ref<SortedFieldsType>({
    order_by: "id",
    desc: false,
    limit: 10,
    skip: 0,
  })

  const columns = ref([
    {
      title: "Обьект",
      sorter: "object_number",
      key: "object_number",
    },
    {
      title: "Адрес",
      sorter: "address",
      key: "address",
    },
    {
      title: "Оператор",
      sorter: "operator_name",
      key: "operator_name",
    },
    {
      title: "Компания",
      sorter: "company_name",
      key: "company.name",
    },
    {
      title: "Регион",
      sorter: "region_name",
      key: "region.name",
    },
    {
      title: "Действия",
      key: "actions",
      fixed: "right",
      className: "custom-buttons",
      render: (row: GasStationPayload) => renderButtons(row),
    },
  ])

  async function initGasStations(sortedFieldsParam?: SortedFieldsType) {
    loading.value = true
    try {
      const response = await fetchGasStations(
        sortedFieldsParam || sortedFields.value
      )

      if (response.status === "error") throw new Error(response.message || "")

      gasStations.value = response.payload.items
      pagination.value = { ...response.payload }
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const saveGasStation = async (form: GasStationPayload) => {
    let isEdit = form.id !== null
    loading.value = true
    try {
      let response
      if (isEdit) {
        response = await updateGasStation(form.id!, form)
      } else {
        response = await createGasStation(form)
      }
      if (response.status === "error") throw new Error(response.message || "")

      message.success("АЗС успешно сохранен")
      closeModal()
      await initGasStations()
    } catch (e) {
      console.error(e)
      message.error((e as any).response?.data?.message)
    } finally {
      loading.value = false
    }
  }

  const removeGasStation = async (id: number) => {
    loading.value = true
    try {
      // Assuming there's a deleteGasStation API function
      const response = await deleteGasStation(id)
      if (response.status === "error") throw new Error(response.message || "")

      message.success("АЗС успешно удалена")
      await initGasStations()
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const renderButtons = (row: GasStationPayload) => {
    const buttons = [
      {
        icon: PencilIcon,
        type: "info",
        onClick: () => {
          gasStationForm.value = Object.assign({}, row)
          isModalOpen.value = true
        },
      },
      {
        icon: TrashIcon,
        type: "error",
        popconfirmText: "Вы уверены, что хотите удалить эту АЗС?",
        onClick: () => removeGasStation(row.id!),
      },
    ]

    return ActionButtons(buttons)
  }

  const closeModal = () => {
    isModalOpen.value = false
  }

  return {
    removeGasStation,
    initGasStations,
    saveGasStation,
    gasStationForm,
    isModalOpen,
    columns,
    closeModal,
    gasStations,
    sortedFields,
    pagination,
    loading,
  }
}
