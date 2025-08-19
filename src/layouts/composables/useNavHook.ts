import { h, Component, ref } from "vue"
import { NIcon } from "naive-ui"
import type { MenuOption } from "naive-ui"
import { RouterLink } from "vue-router"
import { usePermissionsAccess } from "@/composables/usePermissionsAccess.ts"
import { router } from "@/router/router.ts"

import {
  PersonOutline as PersonIcon,
  LogOutOutline as LogoutIcon,
  TicketOutline as ClipboardIcon,
} from "@vicons/ionicons5"
import { useAuthStore } from "@/store/useAuthStore.ts"

export const useNavHook = () => {
  const { logOut } = useAuthStore()

  const menuOptions = ref<MenuOption[]>([
    {
      label: () =>
        h(
          RouterLink,
          {
            to: {
              name: "Tickets",
            },
          },
          { default: () => "Заявки" }
        ),
      key: "go-back-tickets",
      icon: renderIcon(ClipboardIcon),
      show: usePermissionsAccess([
        "superadmin",
        "admin",
        "nurse",
        "doctor",
        "callCenter",
        "assistant",
      ]),
    },
  ])

  function renderIcon(icon: Component) {
    return () => h(NIcon, null, { default: () => h(icon) })
  }

  const options = [
    {
      label: "Профиль",
      key: "profile",
      icon: renderIcon(PersonIcon),
      props: {
        onClick: () => {
          router.push({ name: "Profile" })
        },
      },
    },
    {
      label: "Выход",
      key: "logout",
      icon: renderIcon(LogoutIcon),
      props: {
        onClick: () => logOut(),
      },
    },
  ]

  return {
    options,
    menuOptions,
  }
}
