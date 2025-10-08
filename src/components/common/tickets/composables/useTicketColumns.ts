import { DataTableColumns } from "naive-ui"
import { h, computed } from "vue"
import { NButton, NIcon, NTag } from "naive-ui"
import {
  PencilSharp as PencilIcon,
  TimeOutline as TimeIcon,
  CheckmarkCircle as CheckIcon,
  AlertCircle as AlertIcon,
  CloseCircle as CloseIcon,
} from "@vicons/ionicons5"
import { TicketDetails } from "@/api/tickets/types.ts"
import { dateTime } from "@/utils"
import { useRouter } from "vue-router"
import {
  TicketStatusDictionary,
  StatusType,
  TicketCriticality,
} from "@/utils/types.ts"

export function useTicketColumns() {
  const router = useRouter()

  const getStatusMeta = (status: string) => {
    const label =
      TicketStatusDictionary.StatusType[
        status as keyof typeof TicketStatusDictionary.StatusType
      ] || status

    const metaMap: Record<StatusType, { type: any; icon: any; label: string }> =
      {
        [StatusType.NEW]: { type: "info", icon: TimeIcon, label },
        [StatusType.IN_PROGRESS]: { type: "warning", icon: TimeIcon, label },
        [StatusType.AWAITING_APPROVAL]: {
          type: "info",
          icon: AlertIcon,
          label,
        },
        [StatusType.DONE_CHECKED]: { type: "success", icon: CheckIcon, label },
        [StatusType.DONE_UNCHECKED]: {
          type: "success",
          icon: CheckIcon,
          label,
        },
        [StatusType.REJECTED_BY_CUSTOMER]: {
          type: "error",
          icon: CloseIcon,
          label,
        },
      }

    return (
      metaMap[status as StatusType] || {
        type: "default",
        icon: AlertIcon,
        label,
      }
    )
  }

  const getCriticalityMeta = (criticality: string) => {
    const label =
      TicketStatusDictionary.TicketCriticality[
        criticality as keyof typeof TicketStatusDictionary.TicketCriticality
      ] || criticality

    const metaMap: Record<
      TicketCriticality,
      { type: any; icon: any; label: string }
    > = {
      [TicketCriticality.CRITICAL]: { type: "error", icon: CloseIcon, label },
      [TicketCriticality.SERIOUS]: { type: "warning", icon: AlertIcon, label },
      [TicketCriticality.SIGNIFICANT]: {
        type: "warning",
        icon: AlertIcon,
        label,
      },
      [TicketCriticality.MINOR]: { type: "success", icon: CheckIcon, label },
      [TicketCriticality.SERVICE_REQUEST]: {
        type: "info",
        icon: TimeIcon,
        label,
      },
      [TicketCriticality.PLANNED_MAINTENANCE]: {
        type: "info",
        icon: TimeIcon,
        label,
      },
    }

    return (
      metaMap[criticality as TicketCriticality] || {
        type: "default",
        icon: AlertIcon,
        label,
      }
    )
  }

  const editTicketById = async (id: number) => {
    await router.push(`/tickets/${id}`)
  }

  const columns = computed<DataTableColumns<TicketDetails>>(() => [
    {
      title: "№",
      key: "id",
      width: 80,
      sorter: true,
    },
    {
      title: "Номер заявки",
      key: "ticket_number",
      width: 120,
      sorter: true,
      render: (row: TicketDetails) => row.ticket_number || "-",
    },
    {
      title: "Компания",
      key: "gas_station.company.name",
      width: 180,
      render: (row: TicketDetails) => row.gas_station?.company?.name || "-",
    },
    {
      title: "Номер объекта",
      key: "gas_station.object_number",
      width: 120,
      render: (row: TicketDetails) => {
        const gasStation = row.gas_station
        if (!gasStation) return "-"
        return gasStation.object_number
      },
    },
    {
      title: "Статус",
      key: "status",
      sorter: true,
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
      sorter: true,
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
      title: "Дата подачи",
      key: "submitted_at",
      sorter: true,
      render: (row: TicketDetails) => dateTime(row.submitted_at),
    },
    {
      title: "Плановое время",
      key: "planned_finish_at",
      sorter: true,
      render: (row: TicketDetails) => dateTime(row.planned_finish_at),
    },
    {
      title: "Дата закрытия",
      key: "closed_via_qr_at",
      sorter: true,
      render: (row: TicketDetails) => dateTime(row.closed_via_qr_at),
    },
    {
      title: "ТЗ",
      key: "technical_tasks_preview",
      width: 250,
      ellipsis: false,
      render: (row: TicketDetails) => {
        const tasks = row?.technical_tasks_preview
        if (!tasks || tasks.length === 0) {
          return h(NTag, { type: "default" }, { default: () => "Нет ТЗ" })
        }
        return tasks.map((task) =>
          h(
            NTag,
            { type: "info", style: "margin-right: 5px; margin-bottom: 5px" },
            { default: () => task }
          )
        )
      },
    },
    {
      title: "Содержимое заявки",
      key: "content",
      ellipsis: false,
      render: (row: TicketDetails) => {
        return row.content.slice(0, 50) || "-"
      },
    },
    {
      title: "ФИО исполнителя",
      key: "employee.full_name",
      width: 180,
      render: (row: TicketDetails) => row.employee?.full_name || "-",
    },
    {
      title: "ФИО подавшего заявку",
      key: "gas_station.operator_name",
      width: 180,
      render: (row: TicketDetails) => row.gas_station?.operator_name || "-",
    },
    {
      title: "Адрес",
      key: "gas_station.address",
      width: 200,
      render: (row: TicketDetails) => row.gas_station?.address || "-",
    },
    {
      title: "Регион",
      key: "gas_station.region.name",
      width: 150,
      render: (row: TicketDetails) => row.gas_station?.region?.name || "-",
    },
    {
      title: "Номер СЛ",
      key: "service_sheet_number",
      width: 100,
      sorter: true,
      render: (row: TicketDetails) => row.service_sheet_number || "-",
    },
    {
      title: "Комментарий",
      key: "comment",
      width: 200,
      sorter: true,
      render: (row: TicketDetails) => row.comment || "-",
    },
    {
      title: "Действия",
      key: "actions",
      fixed: "right",

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

  return {
    columns,
    editTicketById,
  }
}
