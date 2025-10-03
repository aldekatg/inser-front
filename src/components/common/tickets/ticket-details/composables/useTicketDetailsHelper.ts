import { ref } from "vue"
import { useMessage } from "naive-ui"
import { fetchTicketById } from "@/api/tickets"
import { TicketDetails, TicketUpdatePayload } from "@/api/tickets/types.ts"

export function useTicketDetailsHelper() {
  const ticketInfo = ref<TicketDetails>()
  const loading = ref(false)

  const message = useMessage()
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
    work_started_at: "",
    work_finished_at: "",
    work_result: null,
    escalation_timeout_minutes: 0,
    escalation_due_at: "",
  })
  const rules = {
    ticket_number: {
      required: true,
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
  return {
    ticketInfo,
    formValue,
    rules,
    loading,
    initTicketById,
  }
}
