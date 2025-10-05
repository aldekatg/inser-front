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
  CheckboxOutline,
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
      key: "Tickets",
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
      key: "Gas Stations",
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
      key: "Employees",
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
              key: "TechnicalSpecs",
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
              key: "Jobs",
              icon: renderIcon(JobIcon),
              show: usePermissionsAccess(["superadmin", "admin", "callCenter"]),
            },
            {
              label: () =>
                h(
                  RouterLink,
                  {
                    to: {
                      name: "Checklists",
                    },
                  },
                  { default: () => "Чек-листы" }
                ),
              key: "Checklists",
              icon: renderIcon(CheckboxOutline),
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
          key: "Companies",
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
          key: "Regions",
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
          key: "Warehouses",
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
