import { h, ref } from "vue"
import { NButton, NIcon, NPopconfirm, useMessage } from "naive-ui"
import { PaginationType } from "@/types.ts"
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

export function useGasStations() {
  const message = useMessage()
  const loading = ref<boolean>(false)
  const gasStations = ref<GasStationType[]>()

  const isModalOpen = ref(false)

  const gasStationForm = ref<GasStationPayload>({
    object_number: "",
    address: "",
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
    has_next: true,
    has_prev: true,
  })

  const columns = ref([
    {
      title: "Обьект",
      key: "object_number",
    },
    {
      title: "Адрес",
      key: "address",
    },
    {
      title: "Оператор",
      key: "operator_name",
    },
    {
      title: "Компания",
      key: "company.name",
    },
    {
      title: "Регион",
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

      message.success("Заправка успешно сохранена")
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
      closeModal()
      await initGasStations() // Refresh the list after saving
    }
  }

  const removeGasStation = async (id: number) => {
    loading.value = true
    try {
      // Assuming there's a deleteGasStation API function
      const response = await deleteGasStation(id)
      if (response.status === "error") throw new Error(response.message || "")

      message.success("Заправка успешно удалена")
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
      await initGasStations() // Refresh the list after deletion
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
        onClick: () => removeGasStation(row.id!),
      },
    ]

    return buttons.map((button: any, _: number) => {
      if (button.type === "error") {
        return h(
          NPopconfirm,
          {
            onPositiveClick: () => button.onClick(),
          },
          {
            default: () => "Вы уверены, что хотите удалить эту заправку?",
            trigger: () =>
              h(
                NButton,
                {
                  strong: true,
                  secondary: true,
                  circle: true,
                  type: button.type,
                },
                {
                  icon: () => h(NIcon, {}, { default: () => h(button.icon) }),
                }
              ),
          }
        )
      }

      return h(
        NButton,
        {
          strong: true,
          secondary: true,
          circle: true,
          type: button.type,
          onClick: () => button.onClick(),
        },
        {
          icon: () => h(NIcon, null, { default: () => h(button.icon) }),
        }
      )
    })
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
    pagination,
    loading,
  }
}
