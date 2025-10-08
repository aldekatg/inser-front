import { ref } from "vue"
import { useMessage } from "naive-ui"
import {
  createTicketReq,
  fetchTicketById,
  syncMaterials,
  updateTicketById,
} from "@/api/tickets"
import {
  TicketCreatePayload,
  TicketDetails,
  TicketUpdatePayload,
} from "@/api/tickets/types.ts"
import { MaterialItem } from "@/components/common/tickets/types.ts"
import { fetchChecklistItems, fetchChecklists } from "@/api/tariffs"
import { ChecklistItemsType, ChecklistType } from "@/api/gas-stations/types.ts"
import { useRouter } from "vue-router"

export function useTicketDetailsHelper() {
  const message = useMessage()
  const router = useRouter()

  const ticketInfo = ref<TicketDetails>()
  const loading = ref(false)

  const checklists = ref<ChecklistType[]>()
  const checklistItems = ref<ChecklistItemsType[]>()

  const formValue = ref<TicketUpdatePayload>({
    gas_station_id: null,
    status: "",
    criticality: "",
    ticket_type: "",
    submitted_at: new Date().getTime(),
    technical_tasks_preview: [],
    technical_tasks_details: [],
    content: "",
    employee_id: null,
    employee: null,
    materials: {},
    id: null,
    guid: "",
    comment: null,
    service_sheet_number: null,
    ticket_number: null,
    diagnostic_result: null,
    created_at: "",
    updated_at: "",
    planned_finish_at: "",
    closed_at: null,
    work_started_at: new Date().getTime(),
    work_finished_at: new Date().getTime(),
    work_result: "",
    escalation_timeout_minutes: 0,
    escalation_due_at: "",
  })
  const rules = {
    ticket_number: {
      required: true,
      type: "text",
      message: "Номер заявки обязателен",
      trigger: ["blur", "input"],
    },
    gas_station_id: {
      required: true,
      type: "number",
      message: "АЗС обязательна",
      trigger: ["blur", "input"],
    },
    employee_id: {
      required: true,
      type: "number",
      message: "Ответственный сотрудник обязателен",
      trigger: ["blur", "input"],
    },
    status: {
      required: true,
      message: "Статус обязателен",
      trigger: ["blur", "input"],
    },
    criticality: {
      required: true,
      message: "Критичность обязательна",
      trigger: ["blur", "input"],
    },
    ticket_type: {
      required: true,
      message: "Тип заявки обязателен",
      trigger: ["blur", "input"],
    },
    submitted_at: {
      required: false,
      type: "number",
      message: "Дата подачи обязательна",
      trigger: ["blur", "change"],
    },
    content: {
      required: true,
      message: "Содержимое заявки обязательно",
      trigger: ["blur", "input"],
    },
  }

  async function initTicketById(id: string | string[]) {
    loading.value = true
    try {
      const response = await fetchTicketById(id)
      if (response.status === "error") {
        message.error(response.message || "Ошибка при загрузке заявок")
        return
      }
      formValue.value = { ...response.payload }
      ticketInfo.value = response.payload
    } catch (e) {
      console.error("Error in initTicketById:", e)
    } finally {
      loading.value = false
    }
  }

  async function initCheckLists() {
    loading.value = true
    try {
      const [checklistResponse, checklistItemsResponse] = await Promise.all([
        fetchChecklists(),
        fetchChecklistItems(),
      ])

      if (
        checklistResponse.status === "error" ||
        checklistItemsResponse.status === "error"
      ) {
        message.error("Ошибка обработки чеклистов")
      }

      checklists.value = checklistResponse.payload.items
      checklistItems.value = checklistItemsResponse.payload.items
    } catch (e) {
    } finally {
      loading.value = false
    }
  }

  async function updateTicket(ticket: TicketUpdatePayload) {
    loading.value = true
    try {
      const response = await updateTicketById(ticket.id!, ticket)
      if (response.status === "error") {
        message.error(response.message || "Ошибка при обновлении заявки")
        return
      }
      message.success("Заявка успешно обновлена")
      ticketInfo.value = { ...response.payload }
    } catch (e) {
      console.error("Error in updateTicket:", e)
    } finally {
      loading.value = false
      await router.push({ name: "Tickets" })
    }
  }
  async function createTicket(ticket: TicketCreatePayload) {
    loading.value = true
    try {
      const response = await createTicketReq(ticket)
      if (response.status === "error") {
        message.error(response.message || "Ошибка при cоздании заявки")
        return
      }
      message.success("Заявка успешно создана")
      ticketInfo.value = { ...response.payload }
    } catch (e) {
      console.error("Error in updateTicket:", e)
    } finally {
      loading.value = false
      await router.push({ name: "Tickets" })
    }
  }

  async function syncWarehouse(data: TicketUpdatePayload) {
    loading.value = true
    try {
      await updateTicket(data)

      const materials = data.materials.map((material: MaterialItem) => ({
        assignment_code: material.assignment_code,
        nomenclature_guid: material.nomenclature_guid,
        quantity: material.quantity,
      }))

      const response = await syncMaterials(data.id!, { materials })

      if (!response || response.status === "error") {
        message.error("Не удалось синхронизировать материалы с складом")
        return
      }

      message.success("Материалы успешно синхронизированы с складом")
    } catch (e) {
      console.error("Error in syncWarehouse:", e)
    } finally {
      loading.value = false
    }
  }

  return {
    ticketInfo,
    formValue,
    rules,
    loading,
    checklists,
    syncWarehouse,
    checklistItems,
    createTicket,
    updateTicket,
    initTicketById,
    initCheckLists,
  }
}
