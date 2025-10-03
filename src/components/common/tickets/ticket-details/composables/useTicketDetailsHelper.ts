import { ref } from "vue"
import { useMessage } from "naive-ui"
import { fetchTicketById } from "@/api/tickets"
import { TicketCreatePayload, TicketDetails } from "@/api/tickets/types.ts"
import { StatusType, TicketCriticality, TicketSource } from "@/utils/types.ts"

export function useTicketDetailsHelper() {
  const ticketInfo = ref<TicketDetails>()
  const loading = ref(false)

  const message = useMessage()
  const formValue = ref<TicketCreatePayload>({
    gas_station_id: null,
    status: "" as StatusType,
    criticality: "" as TicketCriticality,
    ticket_type: "" as TicketSource,
    ticket_number: "",
    submitted_at: new Date(),
    technical_tasks_preview: [],
    technical_tasks_details: [],
    content: "",
    employee_id: null,
    materials: [],
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
      formValue.value = {
        ticket_number: response.payload.ticket_number,
        gas_station_id: response.payload.gas_station_id,
        status: response.payload.status,
        criticality: response.payload.criticality,
        ticket_type: response.payload.ticket_type,
        submitted_at: new Date(response.payload.submitted_at).getTime(),
        technical_tasks_preview: response.payload.technical_tasks_preview,
        technical_tasks_details: response.payload.technical_tasks_details,
        content: response.payload.content,
        employee_id: response.payload.employee_id,
        materials: response.payload.materials || [],
      }
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
