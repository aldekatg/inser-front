import {
  createMemoryHistory,
  createRouter,
} from "vue-router"
import {
  requireAuth,
  shouldBeNotAuthorized,
} from "@/router/guards.ts"

const routes = [
  {
    path: "/auth",
    name: "Authorized",
    component: () =>
      import("@/views/auth/Auth.vue"),
    beforeEnter: [shouldBeNotAuthorized],
  },
  {
    path: "",
    name: "Home",
    component: () =>
      import("@/views/main/Main.vue"),
    beforeEnter: [requireAuth],
  },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
