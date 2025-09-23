import { ref } from "vue"
import { createEmployee, fetchEmployees, updateEmployee } from "@/api/employees"
import { EmployeePayload, EmployeeResponse } from "@/api/employees/types.ts"
import {
  PencilSharp as PencilIcon,
  TrashOutline as TrashIcon,
} from "@vicons/ionicons5"
import { ActionButtons } from "@/utils"
import { useMessage, useNotification } from "naive-ui"
import { PaginationType, SortedFieldsType } from "@/types.ts"

export function useEmployees() {
  const employees = ref<EmployeeResponse[]>([])
  const employeeForm = ref<EmployeePayload>({
    iin: "",
    phone: "",
    email: "",
    full_name: "",
    role: "",
    is_active: false,
    region_id: undefined,
    warehouse_id: undefined,
    parent_id: undefined,
    password: "",
    id: null,
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

  const isModalOpen = ref(false)
  const loading = ref(false)

  const message = useMessage()
  const notification = useNotification()

  const columns = ref([
    {
      title: "Имя",
      sorter: "full_name",
      key: "full_name",
    },
    {
      title: "ИИН",
      sorter: "iin",
      key: "iin",
    },
    {
      title: "Роль",
      sorter: "role",
      key: "role",
    },
    {
      title: "Регион",
      sorter: "region_name",
      key: "region.name",
    },
    {
      title: "Склад",
      sorter: "warehouse_name",
      key: "warehouse.name",
    },
    {
      title: "Действия",
      key: "actions",
      fixed: "right",
      className: "custom-buttons",
      render: (row: EmployeePayload) => renderButtons(row),
    },
  ])

  const renderButtons = (row: EmployeePayload) => {
    const buttons = [
      {
        icon: PencilIcon,
        type: "info",
        onClick: () => {
          employeeForm.value = Object.assign({}, row)
          isModalOpen.value = true
        },
      },
      {
        icon: TrashIcon,
        type: "error",
        popconfirmText: "Вы уверены, что хотите удалить эту заправку?",
        onClick: () => removeEmployee(row.id!),
      },
    ]

    return ActionButtons(buttons)
  }

  const initEmployees = async (sortedFieldsParam?: SortedFieldsType) => {
    try {
      loading.value = true
      const response = await fetchEmployees(
        sortedFieldsParam || sortedFields.value
      )
      if (response.status === "error") {
        throw new Error("Ошибка при загрузке сотрудников")
      }
      employees.value = response.payload.items
      pagination.value = { ...response.payload }
    } catch (error) {
      console.error("Не удалось загрузить сотрудников:", error)
    } finally {
      loading.value = false
    }
  }

  const removeEmployee = async (id: number) => {
    // Логика удаления сотрудника по id
    console.log(`Удаление сотрудника с id: ${id}`)
  }

  const saveEmployee = async (form: EmployeePayload) => {
    try {
      let isEdit = form.id !== null
      loading.value = true
      let response
      if (isEdit) {
        console.log("loading")
        response = await updateEmployee(form.id!, form)
      } else {
        response = await createEmployee(form)
      }
      if (response.status === "error") throw new Error(response.message || "")

      message.success("Сотрудник успешно сохранен")
      console.log("Сотрудник успешно сохранен")
      closeModal()
      await initEmployees()
    } catch (e: any) {
      console.log(e.response.data.message)
      if (e.response.data.message)
        notification.error({
          content: e.response.data.message,
        })

      if (e?.response?.data?.message === "IIN already exists") {
        message.error("Сотрудник с таким ИИН уже существует")
      }
    } finally {
      loading.value = false // Refresh the list after saving
    }
  }

  const closeModal = () => {
    isModalOpen.value = false
    employeeForm.value = {
      iin: "",
      phone: "",
      email: "",
      full_name: "",
      role: "",
      is_active: false,
      region_id: undefined,
      warehouse_id: undefined,
      parent_id: undefined,
      password: "",
      id: null,
    }
  }

  return {
    loading,
    columns,
    employees,
    pagination,
    sortedFields,
    employeeForm,
    isModalOpen,
    closeModal,
    saveEmployee,
    initEmployees,
  }
}
