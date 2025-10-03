import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import { requireAuth, shouldBeNotAuthorized } from "@/router/guards.ts"

const routes: Array<RouteRecordRaw> = [
  {
    path: "/auth",
    name: "Authorized",
    component: () => import("@/views/auth/Auth.vue"),
    beforeEnter: [shouldBeNotAuthorized],
  },
  {
    path: "",
    name: "Home",
    component: () => import("@/views/Main.vue"),
    beforeEnter: [requireAuth],
    redirect: "/tickets",
    children: [
      {
        path: "/tickets",
        name: "Tickets",
        component: () => import("@/components/common/tickets/Tickets.vue"),
      },
      {
        path: "/tickets/create",
        name: "TicketCreate",
        component: () =>
          import("@/components/common/tickets/ticket-details/TicketCreate.vue"),
      },
      {
        path: "/tickets/:id(\\d+)",
        name: "TicketEdit",
        component: () =>
          import("@/components/common/tickets/ticket-details/TicketEdit.vue"),
      },
      {
        path: "/gas-stations",
        name: "Gas Stations",
        component: () =>
          import("@/components/common/gas-stations/GasStations.vue"),
      },
      {
        path: "/companies",
        name: "Companies",
        component: () => import("@/components/common/companies/Companies.vue"),
      },
      {
        path: "/regions",
        name: "Regions",
        component: () => import("@/components/common/regions/Regions.vue"),
      },
      {
        path: "/warehouses",
        name: "Warehouses",
        component: () =>
          import("@/components/common/warehouses/Warehouses.vue"),
      },
      {
        path: "/employees",
        name: "Employees",
        component: () => import("@/components/common/employees/Employees.vue"),
      },
      {
        path: "/tech-specs",
        name: "TechnicalSpecs",
        component: () =>
          import("@/components/common/tariffs/tech-specs/TechnicalSpecs.vue"),
      },
      {
        path: "/work-types",
        name: "Jobs",
        component: () =>
          import("@/components/common/tariffs/work-types/WorkTypes.vue"),
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
