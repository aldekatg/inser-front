import { h, Component, ref } from "vue"
import { NIcon } from "naive-ui"
import type { MenuOption } from "naive-ui"
import { RouterLink } from "vue-router"
import { usePermissionsAccess } from "@/composables/usePermissionsAccess.ts"
import { router } from "@/router/router.ts"

import {
  PersonOutline as PersonIcon,
  LogOutOutline as LogoutIcon,
  ClipboardOutline as ClipboardIcon,
  PinOutline as LocationIcon,
  PersonAddOutline as PersonAddIcon,
  FileTrayStackedOutline as WareHouseIcon,
  AlbumsOutline as DictionaryIcon,
  PeopleOutline as PartnersIcon,
  BusinessOutline as GasStationIcon,
  CashOutline as TariffsIcon,
  DocumentAttachOutline as OrdersIcon,
  BuildOutline as JobIcon,
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
    {
      label: () =>
        h(
          RouterLink,
          {
            to: {
              name: "Gas Stations",
            },
          },
          { default: () => "АЗС" }
        ),
      key: "go-to-gas-station",
      icon: renderIcon(GasStationIcon),
      show: usePermissionsAccess(["superadmin", "admin", "callCenter"]),
    },
    {
      label: () =>
        h(
          RouterLink,
          {
            to: {
              name: "Employees",
            },
          },
          { default: () => "Сотрудники" }
        ),
      key: "go-to-employees",
      icon: renderIcon(PersonAddIcon),
      show: usePermissionsAccess(["superadmin", "admin", "callCenter"]),
    },
    {
      label: "Справочник",
      key: "go-to-dictionary",
      icon: renderIcon(DictionaryIcon),
      show: usePermissionsAccess([
        "superadmin",
        "admin",
        "nurse",
        "doctor",
        "callCenter",
        "assistant",
      ]),
      children: [
        {
          label: "Тарифы",
          key: "go-to-tariffs",
          icon: renderIcon(TariffsIcon),
          show: usePermissionsAccess([
            "superadmin",
            "admin",
            "nurse",
            "doctor",
            "callCenter",
            "assistant",
          ]),
          children: [
            {
              label: () =>
                h(
                  RouterLink,
                  {
                    to: {
                      name: "TechnicalSpecs",
                    },
                  },
                  { default: () => "ТЗ" }
                ),
              key: "go-to-tech-specs",
              icon: renderIcon(OrdersIcon),
              show: usePermissionsAccess(["superadmin", "admin", "callCenter"]),
            },
            {
              label: () =>
                h(
                  RouterLink,
                  {
                    to: {
                      name: "Jobs",
                    },
                  },
                  { default: () => "Виды работ" }
                ),
              key: "go-to-work-types",
              icon: renderIcon(JobIcon),
              show: usePermissionsAccess(["superadmin", "admin", "callCenter"]),
            },
          ],
        },
        {
          label: () =>
            h(
              RouterLink,
              {
                to: {
                  name: "Companies",
                },
              },
              { default: () => "Компании" }
            ),
          key: "go-to-companies",
          icon: renderIcon(PartnersIcon),
          show: usePermissionsAccess(["superadmin", "admin", "callCenter"]),
        },
        {
          label: () =>
            h(
              RouterLink,
              {
                to: {
                  name: "Regions",
                },
              },
              { default: () => "Регионы" }
            ),
          key: "go-to-regions",
          icon: renderIcon(LocationIcon),
          show: usePermissionsAccess(["superadmin", "admin", "callCenter"]),
        },
        {
          label: () =>
            h(
              RouterLink,
              {
                to: {
                  name: "Warehouses",
                },
              },
              { default: () => "Склады" }
            ),
          key: "go-to-warehouse",
          icon: renderIcon(WareHouseIcon),
          show: usePermissionsAccess(["superadmin", "admin", "callCenter"]),
        },
      ],
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
