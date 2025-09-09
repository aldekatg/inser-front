import { h } from "vue"
import { NButton, NIcon, NPopconfirm } from "naive-ui"

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
