import {
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router"
import { useAuthStore } from "@/store/useAuthStore.ts"

export const requireAuth = (
  _: RouteLocationNormalized,
  __: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { isUserAuthorized } = useAuthStore()

  if (!isUserAuthorized) {
    localStorage.removeItem("refreshToken")
    return next("/auth")
  }
  next()
  return
}

export const shouldBeNotAuthorized = (
  _: RouteLocationNormalized,
  __: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { isUserAuthorized } = useAuthStore()
  return isUserAuthorized ? next("/") : next()
}
