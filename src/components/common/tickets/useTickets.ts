import { DataTableColumns, NButton, NIcon, NTag, useMessage } from "naive-ui"
import { h, ref } from "vue"
import { PencilSharp as PencilIcon } from "@vicons/ionicons5"
import { PaginationType, SortedFieldsType } from "@/types.ts"
import { fetchTickets } from "@/api/tickets"
import { TicketDetails } from "@/api/tickets/types.ts"
import { dateTime } from "@/utils"
import { useRouter } from "vue-router"
import { TicketStatusDictionary } from "@/utils/types.ts"

export function useTickets() {
  const message = useMessage()
  const router = useRouter()

  const loading = ref(false)
  const tickets = ref<TicketDetails[]>([])
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
      render: (row: TicketDetails) =>
        TicketStatusDictionary.StatusType[
          row.status as keyof typeof TicketStatusDictionary.StatusType
        ] || row.status,
    },
    {
      title: "Критичность",
      key: "criticality",
      render: (row: TicketDetails) =>
        TicketStatusDictionary.TicketCriticality[
          row.criticality as keyof typeof TicketStatusDictionary.TicketCriticality
        ] || row.criticality,
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
  const sortedFields = ref<SortedFieldsType>({
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
      console.error("Не удалось загрузить сотрудников:", error)
    } finally {
      loading.value = false
    }
  }

  const editTicketById = async (id: number) => {
    await router.push(`/tickets/${id}`)
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
