import {
  createChecklistItemsReq,
  createChecklistReq,
  deleteChecklist,
  deleteChecklistItems,
  fetchChecklistItems,
  fetchChecklists,
  updateChecklistItemsReq,
  updateChecklistReq,
} from "@/api/tariffs"
import { PaginationType, Response, SortedFieldsType } from "@/types.ts"

import {
  ChecklistItemsPayload,
  ChecklistItemsType,
  ChecklistPayload,
  ChecklistType,
} from "@/api/gas-stations/types.ts"

export function useChecklistHelper() {
  const message = useMessage()

  const loading = ref(false)
  const checklists = ref<ChecklistType[]>([])
  const checklistItems = ref<ChecklistItemsType[]>([])

  const checklistForm = ref<ChecklistPayload>({
    technical_task_id: null,
    description: "",
    id: null,
  })
  const checklistItemForm = ref<ChecklistItemsPayload>({
    checklist_id: null,
    code: "",
    description: "",
    id: null,
  })

  const checklistsPagination = ref<PaginationType>({
    total: 0,
    page: 0,
    per_page: 0,
    has_next: false,
    has_prev: false,
  })

  const checklistsSortedFields = ref<SortedFieldsType>({
    order_by: "id",
    desc: false,
    limit: 10,
    skip: 0,
  })

  const checklistItemsPagination = ref<PaginationType>({
    total: 0,
    page: 0,
    per_page: 0,
    has_next: false,
    has_prev: false,
  })

  const checklistItemsSortedFields = ref<SortedFieldsType>({
    order_by: "id",
    desc: false,
    limit: 10,
    skip: 0,
  })

  async function initChecklist(sortedFieldsParam?: SortedFieldsType) {
    loading.value = true
    try {
      const response = await fetchChecklists(
        sortedFieldsParam || checklistsSortedFields.value
      )
      if (response.status === "error") {
        console.log("Ошибка при загрузке чеклистов")
        return
      }

      checklists.value = response.payload.items
      checklistsPagination.value = { ...response.payload }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  async function initChecklistItems(sortedFieldsParam?: SortedFieldsType) {
    loading.value = true
    try {
      const response = await fetchChecklistItems(
        sortedFieldsParam || checklistItemsSortedFields.value
      )
      if (response.status === "error") {
        console.log("Ошибка при загрузке элементов чеклистов")
        return
      }

      checklistItems.value = response.payload.items
      checklistItemsPagination.value = { ...response.payload }
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  async function createChecklist(
    data: ChecklistPayload,
    type: "create" | "edit"
  ) {
    loading.value = true
    try {
      let response: Response<ChecklistType>
      if (type === "edit") {
        response = await updateChecklistReq(data)
      } else {
        response = await createChecklistReq(data)
      }

      if (response.status === "error") {
        message.error(
          response.message || "Ошибка при создании, попробуйте позже"
        )
        return
      }
      message.success("Успешно создано")
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
      await initChecklist()
    }
  }

  async function createChecklistItems(
    data: ChecklistItemsPayload,
    type: "create" | "edit"
  ) {
    loading.value = true
    try {
      let response: Response<ChecklistItemsType>

      if (type === "edit") {
        response = await updateChecklistItemsReq(data)
      } else {
        response = await createChecklistItemsReq(data)
      }
      if (response.status === "error") {
        message.error(
          response.message || "Ошибка при создании, попробуйте позже"
        )
        return
      }
      message.success("Успешно создано")
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
      await initChecklistItems()
    }
  }

  const deleteChecklistUniFunc = async (
    row: ChecklistType | ChecklistItemsType,
    type: "checklists" | "items"
  ) => {
    loading.value = true
    try {
      let response: Response<any>
      if (type === "checklists") {
        response = await deleteChecklist(row.id)
      } else {
        response = await deleteChecklistItems(row.id)
      }

      if (response.status === "error") {
        message.error(response.message || "Ошибка при удалении")
        return
      }

      message.success("Успешно удалено")
    } catch (e) {
    } finally {
      if (type === "checklists") {
        await initChecklist()
      } else {
        await initChecklistItems()
      }
      loading.value = false
    }
  }

  return {
    loading,

    checklistForm,
    checklistItemForm,

    checklists,
    initChecklistItems,
    initChecklist,
    checklistItems,

    createChecklist,
    createChecklistItems,

    deleteChecklistUniFunc,

    checklistsPagination,
    checklistsSortedFields,
    checklistItemsPagination,
    checklistItemsSortedFields,
  }
}
