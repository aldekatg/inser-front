import { useMessage } from "naive-ui"
import { ref } from "vue"
import { PaginationType, SortedFieldsType } from "@/types.ts"
import {
  PencilSharp as PencilIcon,
  TrashOutline as TrashIcon,
} from "@vicons/ionicons5"
import { ActionButtons } from "@/utils"
import {
  createTechnicalTask,
  deleteTechnicalTask,
  fetchTechnicalTasks,
  updateTechnicalTask,
} from "@/api/tariffs"
import { useDictionaryStore } from "@/store/useDictionary.ts"
import { storeToRefs } from "pinia"
import { TechnicalTaskDetail } from "@/api/tickets/types.ts"

export function useTechSpecs() {
  const message = useMessage()
  const { technical_tasks } = storeToRefs(useDictionaryStore())

  const isModalOpen = ref(false)
  const loading = ref(false)
  const techTasks = ref<TechnicalTaskDetail[]>([])
  const techTaskForm = ref<TechnicalTaskDetail>({
    code: "",
    description: "",
    id: null,
    work_types: [],
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
      render: (row: TechnicalTaskDetail) => renderButtons(row),
    },
  ])

  async function initTechTasks(sortedFieldsParam?: SortedFieldsType) {
    loading.value = true
    try {
      const response = await fetchTechnicalTasks(
        sortedFieldsParam || sortedFields.value
      )
      if (response.status === "error") throw new Error(response.message || "")

      technical_tasks.value = response.payload.items
      techTasks.value = response.payload.items
      pagination.value = { ...response.payload }
    } catch (e) {
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  const removeTechTask = async (id: number) => {
    loading.value = true
    try {
      const response = await deleteTechnicalTask(id)
      if (response.status === "error") throw new Error(response.message || "")

      message.success("ТЗ успешно удалена")
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
      await initTechTasks()
    }
  }

  const saveTechTask = async (form: TechnicalTaskDetail) => {
    let isEdit = form.id !== null
    loading.value = true
    try {
      let response
      if (isEdit) {
        response = await updateTechnicalTask(form.id!, form)
      } else {
        response = await createTechnicalTask(form)
      }
      if (response.status === "error") throw new Error(response.message || "")

      message.success("ТЗ успешно сохранено")
    } catch (e) {
      console.error(e)
      message.error((e as any).response?.data?.message)
    } finally {
      loading.value = false
      closeModal()
      await initTechTasks()
    }
  }

  const renderButtons = (row: TechnicalTaskDetail) => {
    const buttons = [
      {
        icon: PencilIcon,
        type: "info",
        onClick: () => {
          techTaskForm.value = Object.assign({}, row)
          isModalOpen.value = true
        },
      },
      {
        icon: TrashIcon,
        type: "error",
        popconfirmText: "Вы уверены, что хотите удалить ТЗ?",
        onClick: () => removeTechTask(row.id!),
      },
    ]

    return ActionButtons(buttons)
  }

  const closeModal = () => {
    isModalOpen.value = false
  }

  return {
    techTasks,
    loading,
    techTaskForm,
    sortedFields,
    initTechTasks,
    removeTechTask,
    pagination,
    saveTechTask,
    isModalOpen,
    columns,
    closeModal,
  }
}
