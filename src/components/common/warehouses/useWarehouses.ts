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
import { PaginationType, SortedFieldsType } from "@/types.ts"

export function useWarehouses() {
  const isModalOpen = ref(false)
  const store = useDictionaryStore()
  const loading = ref(false)
  const message = useMessage()

  const { isWarehouses } = storeToRefs(store)

  const warehouses = ref<WarehouseType[]>(isWarehouses?.value || [])
  const warehouseForm = ref<WarehouseType>({
    name: "",
    responsible_iin: "",
    guid: "",
    id: undefined,
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
      title: "Название",
      sorter: "name",
      key: "name",
    },
    {
      title: "GUID",
      sorter: "guid",
      key: "guid",
    },
    {
      title: "Ответственный",
      sorter: "responsible_iin",
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
      guid: "",
      responsible_iin: "",
      id: undefined,
    }
  }

  async function initWarehouses(sortedFieldsParam?: SortedFieldsType) {
    loading.value = true
    try {
      const response = await fetchWarehouses(
        sortedFieldsParam || sortedFields.value
      )

      if (response.status === "error")
        throw new Error("Ошибка при загрузке складов")

      warehouses.value = response.payload.items
      pagination.value = { ...response.payload }
    } catch (error) {
      console.error("Ошибка при загрузке складов:", error)
      message.error("Ошибка при загрузке складов")
    } finally {
      loading.value = false
    }
  }

  async function saveWarehouse(form: WarehouseType) {
    let isEdit = form.id !== undefined
    loading.value = true
    try {
      let response
      console.log(isEdit)
      if (isEdit) {
        response = await updateWarehouse(form.id!, form)
      } else {
        response = await createWarehouse(form)
      }
      if (response.status === "error") throw new Error(response.message || "")

      message.success("Склад успешно сохранен")
      closeModal()
      await initWarehouses() // Refresh the list after saving
    } catch (e) {
      console.error(e)
      message.error((e as any).response?.data?.message)
    } finally {
      loading.value = false
      await store.initDictionary() // Обновляем словарь в хранилище
    }
  }

  async function removeWarehouse(id: number) {
    try {
      const response = await deleteWarehouse(id)
      if (response.status === "error") throw new Error(response.message || "")

      message.success("Склад успешно удален")
      await initWarehouses()
    } catch (e) {
      console.error(e)
    }
  }

  return {
    loading,
    pagination,
    sortedFields,
    warehouses,
    warehouseForm,
    saveWarehouse,
    initWarehouses,
    isModalOpen,
    columns,
    closeModal,
  }
}
