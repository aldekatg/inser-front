import { ref } from "vue"
import { useMessage } from "naive-ui"
import {
  createCompany,
  deleteCompany,
  fetchCompanies,
  updateCompanies,
} from "@/api/dictionary"
import { useDictionaryStore } from "@/store/useDictionary.ts"
import { storeToRefs } from "pinia"
import { CompanyType } from "@/api/gas-stations/types.ts"
import {
  PencilSharp as PencilIcon,
  TrashOutline as TrashIcon,
} from "@vicons/ionicons5"
import { ActionButtons } from "@/utils"
import { PaginationType, SortedFieldsType } from "@/types.ts"

export function useCompanies() {
  const isModalOpen = ref(false)
  const store = useDictionaryStore()

  const { isCompanies } = storeToRefs(store)

  const companies = ref<CompanyType[]>(isCompanies?.value || [])
  const companyForm = ref<CompanyType>({
    name: "",
    bin: "",
  })
  const isLoading = ref(false)

  const message = useMessage()

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
      title: "БИН",
      sorter: "bin",
      key: "bin",
    },
    {
      title: "Действия",
      key: "actions",
      fixed: "right",
      className: "custom-buttons",
      render: (row: CompanyType) => renderButtons(row),
    },
  ])

  const renderButtons = (row: CompanyType) => {
    const buttons = [
      {
        icon: PencilIcon,
        type: "info",
        onClick: () => {
          companyForm.value = Object.assign({}, row)
          isModalOpen.value = true
        },
      },
      {
        icon: TrashIcon,
        popconfirmText: "Вы уверены, что хотите удалить эту компанию?",
        type: "error",
        onClick: () => removeCompany(row.id!),
      },
    ]

    return ActionButtons(buttons)
  }

  function closeModal() {
    isModalOpen.value = false
    companyForm.value = {
      name: "",
      bin: "",
      id: undefined,
    }
  }

  async function initCompanies(sortedFieldsParam?: SortedFieldsType) {
    isLoading.value = true
    try {
      const response = await fetchCompanies(
        sortedFieldsParam || sortedFields.value
      )

      if (response.status === "error")
        throw new Error("Ошибка при загрузке компаний")

      companies.value = response.payload.items
      pagination.value = { ...response.payload }
    } catch (error) {
      console.error("Ошибка при загрузке компаний:", error)
      message.error("Ошибка при загрузке компаний")
    } finally {
      isLoading.value = false
    }
  }

  async function saveCompany(form: CompanyType) {
    let isEdit = form.id !== undefined
    isLoading.value = true
    try {
      let response
      console.log(isEdit)
      if (isEdit) {
        response = await updateCompanies(form.id!, form)
      } else {
        response = await createCompany(form)
      }
      if (response.status === "error") throw new Error(response.message || "")

      message.success("Компания успешно сохранена")
      closeModal()
      await initCompanies() // Refresh the list after saving
    } catch (e) {
      console.error(e)
      message.error("Ошибка при сохранении компании")
    } finally {
      isLoading.value = false
      await store.initDictionary() // Обновляем словарь в хранилище
    }
  }

  async function removeCompany(id: number) {
    try {
      const response = await deleteCompany(id)
      if (response.status === "error") throw new Error(response.message || "")

      message.success("Компания успешно удален")
      await initCompanies() // Refresh the list after deletion
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
      await store.initDictionary() // Обновляем словарь в хранилище
    }
  }

  return {
    loading: isLoading,
    pagination,
    sortedFields,

    companies,
    companyForm,
    saveCompany,
    initCompanies,
    isModalOpen,
    columns,
    closeModal,
  }
}
