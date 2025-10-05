import { h } from "vue"
import { NButton, NIcon, NPopconfirm } from "naive-ui"
import { SortedFieldsType } from "@/types.ts"
import {
  StatusType,
  TicketCriticality,
  TicketSource,
  TicketStatusDictionary,
} from "@/utils/types.ts"

export function ActionButtons(buttons: any[]) {
  return buttons.map((button: any, _: number) => {
    if (button.type === "error") {
      return h(
        NPopconfirm,
        {
          onPositiveClick: () => button.onClick(),
        },
        {
          default: () => button.popconfirmText || "Вы уверены?",
          trigger: () =>
            h(
              NButton,
              {
                strong: true,
                secondary: true,
                circle: true,
                type: button.type,
              },
              {
                icon: () => h(NIcon, {}, { default: () => h(button.icon) }),
              }
            ),
        }
      )
    }

    return h(
      NButton,
      {
        strong: true,
        secondary: true,
        circle: true,
        type: button.type,
        onClick: () => button.onClick(),
      },
      {
        icon: () => h(NIcon, null, { default: () => h(button.icon) }),
      }
    )
  })
}

export const handleUpdateSorter = (
  sorter: { columnKey: string; sorter: string; order: string | null },
  initFunction: (sortedFields: SortedFieldsType) => void,
  sortedFields: SortedFieldsType
) => {
  if (sorter.order) {
    sortedFields.order_by = sorter.sorter
    sortedFields.desc = sorter.order === "descend"
  } else {
    sortedFields.order_by = "id"
    sortedFields.desc = false
  }
  initFunction(sortedFields)
}

// DD.MM.YYYY
export function dateStr(date: string): string {
  if (date) {
    const splitted = date.split(/[-T.Z]/)
    return `${splitted[2]}.${splitted[1]}.${splitted[0]}`
  } else {
    return "..."
  }
}
// DD.MM.YYYY HH:MM
export function dateTime(date: string): string {
  if (date) {
    const splitted = date.split(/[-T.Z]/)
    return `${splitted[2]}.${splitted[1]}.${splitted[0]} ${splitted[3]}`
  } else {
    return "..."
  }
}

export const criticalityOptions = Object.entries(TicketCriticality).map(
  ([_, value]) => ({
    label: TicketStatusDictionary.TicketCriticality[value],
    value,
  })
)
export const statusOptions = Object.entries(StatusType).map(([_, value]) => ({
  label: TicketStatusDictionary.StatusType[value],
  value,
}))

export const statusSource = Object.entries(TicketSource).map(([_, value]) => ({
  label: TicketStatusDictionary.TicketSource[value],
  value,
}))
