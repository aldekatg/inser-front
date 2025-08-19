import { createMemoryHistory, createRouter, RouteRecordRaw } from "vue-router"
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
    component: () => import("@/views/main/Main.vue"),
    beforeEnter: [requireAuth],
    redirect: "/tickets",
    children: [
      {
        path: "/tickets",
        name: "Tickets",
        component: () => import("@/components/common/Tickets.vue"),
      },
    ],
  },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
