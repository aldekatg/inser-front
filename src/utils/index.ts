import { h } from "vue"
import { NButton, NIcon, NPopconfirm } from "naive-ui"
import { SortedFieldsType } from "@/types.ts"

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
