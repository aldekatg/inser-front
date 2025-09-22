import { ref } from "vue"
import { createEmployee, fetchEmployees, updateEmployee } from "@/api/employees"
import { EmployeePayload, EmployeeResponse } from "@/api/employees/types.ts"
import {
  PencilSharp as PencilIcon,
  TrashOutline as TrashIcon,
} from "@vicons/ionicons5"
import { ActionButtons } from "@/utils"
import { useMessage, useNotification } from "naive-ui"

export function useEmployees() {
  const employees = ref<EmployeeResponse[]>()
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
  const isModalOpen = ref(false)
  const loading = ref(false)

  const message = useMessage()
  const notification = useNotification()

  const columns = ref([
    {
      title: "Имя",
      key: "full_name",
    },
    {
      title: "ИИН",
      key: "iin",
    },
    {
      title: "Роль",
      key: "role",
    },
    {
      title: "Регион",
      key: "region.name",
    },
    {
      title: "Склад",
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

  const initEmployees = async () => {
    try {
      loading.value = true
      const response = await fetchEmployees()
      if (response.status === "error") {
        throw new Error("Ошибка при загрузке сотрудников")
      }
      employees.value = response.payload.items
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
    employeeForm,
    isModalOpen,
    closeModal,
    saveEmployee,
    initEmployees,
  }
}
