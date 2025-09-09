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
        component: () => import("@/components/common/Tickets.vue"),
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
        component: () => import("@/components/common/Tickets.vue"),
      },
      {
        path: "/regions",
        name: "Regions",
        component: () => import("@/components/common/Tickets.vue"),
      },
      {
        path: "/warehouses",
        name: "Warehouses",
        component: () => import("@/components/common/Tickets.vue"),
      },
      {
        path: "/employees",
        name: "Employees",
        component: () => import("@/components/common/Tickets.vue"),
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
