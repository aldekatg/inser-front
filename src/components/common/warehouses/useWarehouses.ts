import { ref } from "vue"
import { useMessage } from "naive-ui"
import {
  createWarehouse,
  deleteWarehouse,
  fetchWarehouses,
  updateWarehouse,
} from "@/api/dictionary"
import { useDictionaryStore } from "@/store/useDictionary.ts"
import { storeToRefs } from "pinia"
import { WarehouseType } from "@/api/gas-stations/types.ts"
import {
  PencilSharp as PencilIcon,
  TrashOutline as TrashIcon,
} from "@vicons/ionicons5"
import { ActionButtons } from "@/utils"

export function useWarehouses() {
  const isModalOpen = ref(false)
  const store = useDictionaryStore()
  const isLoading = ref(false)
  const message = useMessage()

  const { isWarehouses } = storeToRefs(store)

  const warehouses = ref<WarehouseType[]>(isWarehouses?.value || [])
  const warehouseForm = ref<WarehouseType>({
    name: "",
    responsible_iin: "",
    id: undefined,
  })

  const columns = ref([
    {
      title: "Название",
      key: "name",
    },
    {
      title: "Ответственный",
      key: "responsible_iin",
    },
    {
      title: "Действия",
      key: "actions",
      fixed: "right",
      className: "custom-buttons",
      render: (row: WarehouseType) => renderButtons(row),
    },
  ])

  const renderButtons = (row: WarehouseType) => {
    const buttons = [
      {
        icon: PencilIcon,
        type: "info",
        onClick: () => {
          warehouseForm.value = Object.assign({}, row)
          isModalOpen.value = true
        },
      },
      {
        icon: TrashIcon,
        popconfirmText: "Вы уверены, что хотите удалить этот склад?",
        type: "error",
        onClick: () => removeWarehouse(row.id!),
      },
    ]

    return ActionButtons(buttons)
  }

  function closeModal() {
    isModalOpen.value = false
    warehouseForm.value = {
      name: "",
      responsible_iin: "",
      id: undefined,
    }
  }

  async function initWarehouses() {
    isLoading.value = true
    try {
      const response = await fetchWarehouses()

      if (response.status === "error")
        throw new Error("Ошибка при загрузке компаний")

      warehouses.value = response.payload.items
    } catch (error) {
      console.error("Ошибка при загрузке компаний:", error)
      message.error("Ошибка при загрузке компаний")
    } finally {
      isLoading.value = false
    }
  }

  async function saveWarehouse(form: WarehouseType) {
    let isEdit = form.id !== undefined
    isLoading.value = true
    try {
      let response
      console.log(isEdit)
      if (isEdit) {
        response = await updateWarehouse(form.id!, form)
      } else {
        response = await createWarehouse(form)
      }
      if (response.status === "error") throw new Error(response.message || "")

      message.success("Компания успешно сохранена")
      closeModal()
      await initWarehouses() // Refresh the list after saving
    } catch (e) {
      console.error(e)
      message.error("Ошибка при сохранении компании")
    } finally {
      isLoading.value = false
      await store.initDictionary() // Обновляем словарь в хранилище
    }
  }

  async function removeWarehouse(id: number) {
    try {
      const response = await deleteWarehouse(id)
      if (response.status === "error") throw new Error(response.message || "")

      message.success("Компания успешно удален")
      await initWarehouses() // Refresh the list after deletion
    } catch (e) {
      console.error(e)
    }
  }

  return {
    isLoading,

    warehouses,
    warehouseForm,
    saveWarehouse,
    initWarehouses,
    isModalOpen,
    columns,
    closeModal,
  }
}
