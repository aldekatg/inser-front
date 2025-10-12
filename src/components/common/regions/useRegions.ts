import { ref } from "vue"
import { useMessage } from "naive-ui"
import {
  createRegion,
  deleteRegion,
  fetchRegions,
  updateRegion,
} from "@/api/dictionary"
import { useDictionaryStore } from "@/store/useDictionary.ts"
import { storeToRefs } from "pinia"
import { RegionType } from "@/api/gas-stations/types.ts"
import {
  PencilSharp as PencilIcon,
  TrashOutline as TrashIcon,
} from "@vicons/ionicons5"
import { ActionButtons } from "@/utils"

export function useRegions() {
  const isModalOpen = ref(false)
  const store = useDictionaryStore()

  const { isRegions } = storeToRefs(store)
  const regions = ref<RegionType[]>(isRegions?.value || [])
  const regionsForm = ref<RegionType>({
    name: "",
    id: undefined,
  })
  const loading = ref(false)

  const message = useMessage()

  const columns = ref([
    {
      title: "Название",
      key: "name",
    },
    {
      title: "Действия",
      key: "actions",
      fixed: "right",
      className: "custom-buttons",
      render: (row: RegionType) => renderButtons(row),
    },
  ])

  const renderButtons = (row: RegionType) => {
    const buttons = [
      {
        icon: PencilIcon,
        type: "info",
        onClick: () => {
          regionsForm.value = Object.assign({}, row)
          isModalOpen.value = true
        },
      },
      {
        icon: TrashIcon,
        popconfirmText: "Вы уверены, что хотите удалить этот регион?",
        type: "error",
        onClick: () => removeRegion(row.id!),
      },
    ]

    return ActionButtons(buttons)
  }

  function closeModal() {
    isModalOpen.value = false
    regionsForm.value = {
      name: "",
      id: undefined,
    }
  }

  async function initRegions() {
    loading.value = true
    try {
      const response = await fetchRegions()

      if (response.status === "error")
        throw new Error("Ошибка при загрузке регионов")

      regions.value = response.payload.items
    } catch (error) {
      console.error("Ошибка при загрузке регионов:", error)
      message.error("Ошибка при загрузке регионов")
    } finally {
      loading.value = false
    }
  }

  async function saveRegion(form: RegionType) {
    let isEdit = form.id !== undefined
    loading.value = true
    try {
      let response
      console.log(isEdit)
      if (isEdit) {
        response = await updateRegion(form.id!, form)
      } else {
        response = await createRegion(form)
      }
      if (response.status === "error") throw new Error(response.message || "")

      message.success("Регион успешно сохранен")
      closeModal()
      await initRegions()
    } catch (e) {
      console.error(e)
      message.error("Ошибка при сохранении региона")
    } finally {
      loading.value = false
      await store.initDictionary() // Обновляем словарь в хранилище
    }
  }

  async function removeRegion(id: number) {
    try {
      const response = await deleteRegion(id)
      if (response.status === "error") throw new Error(response.message || "")

      message.success("Регион успешно удален")
      await initRegions() // Refresh the list after deletion
    } catch (e) {
      console.error(e)
    }
  }

  return {
    loading,

    regions,
    regionsForm,
    saveRegion,
    initRegions,
    isModalOpen,
    columns,
    closeModal,
  }
}
