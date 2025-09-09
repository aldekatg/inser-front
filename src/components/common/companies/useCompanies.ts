import { ref } from "vue"
import { useMessage } from "naive-ui"
import {
  createCompany,
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

export function useCompanies() {
  const isModalOpen = ref(false)

  const { isCompanies } = storeToRefs(useDictionaryStore())

  const companies = ref<CompanyType[]>(isCompanies?.value || [])
  const companyForm = ref<CompanyType>({
    name: "",
    bin: "",
  })
  const isLoading = ref(false)

  const message = useMessage()

  const columns = ref([
    {
      title: "Название",
      key: "name",
    },
    {
      title: "БИН",
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
        onClick: () => removeGasStation(row.id!),
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

  async function initCompanies() {
    isLoading.value = true
    try {
      const response = await fetchCompanies()

      if (response.status === "error")
        throw new Error("Ошибка при загрузке компаний")

      companies.value = response.payload.items
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
    }
  }

  function removeGasStation(id: number) {
    console.log("Удаление компании с ID:", id)
  }

  return {
    isLoading,

    companies,
    companyForm,
    saveCompany,
    initCompanies,
    isModalOpen,
    columns,
    closeModal,
  }
}
