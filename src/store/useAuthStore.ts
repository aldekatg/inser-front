import { defineStore } from "pinia"
import { router } from "@/router/router.ts"
import { jwtDecode } from "jwt-decode"

interface AuthState {
  user: {
    type: string
    role: string
    name: string
    exp: number
    iat: number
  } | null
  token: string
  refreshToken: string
  tokenTimerId?: NodeJS.Timeout
}

export const useAuthStore = defineStore("authStore", {
  state: (): AuthState => ({
    user: null,
    token: "",
    refreshToken: "",
    tokenTimerId: undefined,
  }),
  getters: {
    isUserAuthorized: (state: AuthState) => !!state.token,
  },
  actions: {
    initAuth(token: string, refreshToken: string) {
      if (!token) return
      this.token = token
      this.user = jwtDecode(token)
      this.refreshToken = refreshToken
      localStorage.setItem("token", token)
      localStorage.setItem("refreshToken", refreshToken)
    },
    async logOut() {
      this.user = null
      this.token = ""
      localStorage.removeItem("base64Token")
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      await router.push("/auth")
    },
  },
})
