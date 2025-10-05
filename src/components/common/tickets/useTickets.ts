import {
  DataTableColumns,
  NButton,
  NIcon,
  NTag,
  useMessage,
  useLoadingBar,
} from "naive-ui"
import { h, ref } from "vue"
import {
  PencilSharp as PencilIcon,
  TimeOutline as TimeIcon,
  CheckmarkCircle as CheckIcon,
  AlertCircle as AlertIcon,
  CloseCircle as CloseIcon,
} from "@vicons/ionicons5"
import { PaginationType, SortedFieldsType } from "@/types.ts"
import { fetchTickets } from "@/api/tickets"
import { TicketDetails } from "@/api/tickets/types.ts"
import { dateTime } from "@/utils"
import { useRouter } from "vue-router"
import {
  TicketStatusDictionary,
  StatusType,
  TicketCriticality,
} from "@/utils/types.ts"

export function useTickets() {
  const message = useMessage()
  const loadingBar = useLoadingBar()
  const router = useRouter()

  const loading = ref(false)
  const tickets = ref<TicketDetails[]>([])
  function getStatusMeta(status: string): {
    type: "default" | "success" | "info" | "warning" | "error"
    icon: any
    label: string
  } {
    const label =
      TicketStatusDictionary.StatusType[
        status as keyof typeof TicketStatusDictionary.StatusType
      ] || status
    switch (status as StatusType) {
      case StatusType.NEW:
        return { type: "info", icon: TimeIcon, label }
      case StatusType.IN_PROGRESS:
        return { type: "warning", icon: TimeIcon, label }
      case StatusType.AWAITING_APPROVAL:
        return { type: "info", icon: AlertIcon, label }
      case StatusType.DONE_CHECKED:
        return { type: "success", icon: CheckIcon, label }
      case StatusType.DONE_UNCHECKED:
        return { type: "success", icon: CheckIcon, label }
      case StatusType.REJECTED_BY_CUSTOMER:
        return { type: "error", icon: CloseIcon, label }
      default:
        return { type: "default", icon: AlertIcon, label }
    }
  }

  function getCriticalityMeta(criticality: string): {
    type: "default" | "success" | "info" | "warning" | "error"
    icon: any
    label: string
  } {
    const label =
      TicketStatusDictionary.TicketCriticality[
        criticality as keyof typeof TicketStatusDictionary.TicketCriticality
      ] || criticality
    switch (criticality as TicketCriticality) {
      case TicketCriticality.CRITICAL:
        return { type: "error", icon: CloseIcon, label }
      case TicketCriticality.SERIOUS:
        return { type: "warning", icon: AlertIcon, label }
      case TicketCriticality.SIGNIFICANT:
        return { type: "warning", icon: AlertIcon, label }
      case TicketCriticality.MINOR:
        return { type: "success", icon: CheckIcon, label }
      case TicketCriticality.SERVICE_REQUEST:
        return { type: "info", icon: TimeIcon, label }
      case TicketCriticality.PLANNED_MAINTENANCE:
        return { type: "info", icon: TimeIcon, label }
      default:
        return { type: "default", icon: AlertIcon, label }
    }
  }
  const columns = ref<DataTableColumns<TicketDetails>>([
    {
      title: "№",
      key: "id",
    },
    {
      title: "АЗС",
      key: "gas_station.object_number",
    },
    {
      title: "Статус",
      key: "status",
      render: (row: TicketDetails) => {
        const meta = getStatusMeta(row.status)
        return h(
          NTag,
          { type: meta.type, bordered: false, size: "small" },
          {
            icon: () => h(NIcon, null, { default: () => h(meta.icon) }),
            default: () => meta.label,
          }
        )
      },
    },
    {
      title: "Критичность",
      key: "criticality",
      render: (row: TicketDetails) => {
        const meta = getCriticalityMeta(row.criticality)
        return h(
          NTag,
          { type: meta.type, bordered: false, size: "small" },
          {
            icon: () => h(NIcon, null, { default: () => h(meta.icon) }),
            default: () => meta.label,
          }
        )
      },
    },
    {
      title: "Дата создания",
      key: "created_at",
      render: (row: TicketDetails) => dateTime(row.created_at),
    },
    {
      title: "Дата подачи",
      key: "submitted_at",
      render: (row: TicketDetails) => dateTime(row.submitted_at),
    },
    {
      title: "Плановое время",
      key: "planned_finish_at",
      render: (row: TicketDetails) => dateTime(row.planned_finish_at),
    },
    {
      title: "Дата закрытия",
      key: "closed_via_qr_at",
      render: (row: TicketDetails) => dateTime(row.closed_via_qr_at),
    },
    {
      title: "ТЗ",
      key: "technical_task",
      className: "tz-style",
      render: (row: TicketDetails) => {
        return row.technical_tasks_preview.map((task) =>
          h(NTag, { type: "info" }, { default: () => task })
        )
      },
    },
    {
      title: "Содержимое заявки",
      key: "",
    },
    {
      title: "‏‎",
      key: "actions",
      fixed: "right",
      className: "custom-buttons",
      render: (row: TicketDetails) =>
        h(
          NButton,
          {
            strong: true,
            secondary: true,
            circle: true,
            type: "info",
            onClick: () => editTicketById(row.id),
          },
          {
            icon: () => h(NIcon, null, { default: () => h(PencilIcon) }),
          }
        ),
    },
  ])
  const pagination = ref<PaginationType>({
    total: 0,
    page: 0,
    per_page: 0,
    has_next: false,
    has_prev: false,
  })
  const sortedFields = ref({
    ticket_type: "customer_call",
    order_by: "id",
    desc: false,
    limit: 10,
    skip: 0,
  })

  async function initTickets(sortedFieldsParam?: SortedFieldsType) {
    try {
      loading.value = true
      const response = await fetchTickets(
        sortedFieldsParam || sortedFields.value
      )
      if (response.status === "error") {
        message.error(response.message || "Ошибка при загрузке заявок")
        return
      }
      tickets.value = response.payload.items
      pagination.value = { ...response.payload }
    } catch (error) {
      message.error("Не удалось загрузить заявки")
      console.error("Не удалось загрузить заявки:", error)
    } finally {
      loading.value = false
    }
  }

  const editTicketById = async (id: number) => {
    try {
      loadingBar?.start()
      await router.push(`/tickets/${id}`)
      loadingBar?.finish()
    } catch (e) {
      loadingBar?.error()
      throw e
    }
  }
  return {
    data: tickets,
    columns,
    loading,
    pagination,
    sortedFields,
    initTickets,
  }
}
