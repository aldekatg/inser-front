import { ref } from "vue"
import { WorkType } from "@/api/tariffs/types.ts"
import { PaginationType, SortedFieldsType } from "@/types.ts"
import {
  createWorkType,
  deleteWorkType,
  fetchWorkTypes,
  updateWorkType,
} from "@/api/tariffs"
import { useMessage } from "naive-ui"
import {
  PencilSharp as PencilIcon,
  TrashOutline as TrashIcon,
} from "@vicons/ionicons5"
import { ActionButtons } from "@/utils"

export function useWorkTypes() {
  const message = useMessage()

  const isModalOpen = ref(false)
  const loading = ref(false)
  const workTypes = ref<WorkType[]>([])
  const workTypeForm = ref<WorkType>({
    code: "",
    description: "",
    id: null,
    technical_task_id: null,
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
      title: "Код",
      fixed: "left",
      width: "100",
      sorter: "code",
      key: "code",
    },

    {
      title: "Описание",
      sorter: "description",
      width: "70%",
      key: "description",
    },
    {
      title: "Действия",
      key: "actions",
      fixed: "right",
      className: "custom-buttons",
      render: (row: WorkType) => renderButtons(row),
    },
  ])

  async function initWorkTypes(sortedFieldsParam?: SortedFieldsType) {
    loading.value = true
    try {
      const response = await fetchWorkTypes(
        sortedFieldsParam || sortedFields.value
      )
      if (response.status === "error") throw new Error(response.message || "")

      workTypes.value = response.payload.items
      pagination.value = { ...response.payload }
    } catch (e) {
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  const removeWorkType = async (id: number) => {
    loading.value = true
    try {
      // Assuming there's a deleteGasStation API function
      const response = await deleteWorkType(id)
      if (response.status === "error") throw new Error(response.message || "")

      message.success("Заправка успешно удалена")
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
      await initWorkTypes() // Refresh the list after deletion
    }
  }

  const saveWorkType = async (form: WorkType) => {
    let isEdit = form.id !== null
    loading.value = true
    try {
      let response
      if (isEdit) {
        response = await updateWorkType(form.id!, form)
      } else {
        response = await createWorkType(form)
      }
      if (response.status === "error") throw new Error(response.message || "")

      message.success("Заправка успешно сохранена")
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
      closeModal()
      await initWorkTypes() // Refresh the list after saving
    }
  }

  const renderButtons = (row: WorkType) => {
    const buttons = [
      {
        icon: PencilIcon,
        type: "info",
        onClick: () => {
          workTypeForm.value = Object.assign({}, row)
          isModalOpen.value = true
        },
      },
      {
        icon: TrashIcon,
        type: "error",
        popconfirmText: "Вы уверены, что хотите удалить ТЗ?",
        onClick: () => removeWorkType(row.id!),
      },
    ]

    return ActionButtons(buttons)
  }

  const closeModal = () => {
    isModalOpen.value = false
  }

  return {
    workTypes,
    loading,
    workTypeForm,
    sortedFields,
    initWorkTypes,
    pagination,
    removeWorkType,
    saveWorkType,
    isModalOpen,
    columns,
    closeModal,
  }
}
