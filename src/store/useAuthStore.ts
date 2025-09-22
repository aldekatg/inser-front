import { defineStore } from "pinia"
// import { refreshAccessToken } from "@/api/auth"
import { useRouter } from "vue-router"

const router = useRouter()
interface AuthState {
  user: null
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
      this.refreshToken = refreshToken
      localStorage.setItem("token", token)
      localStorage.setItem("refreshToken", refreshToken)
    },
    // async refreshAccessToken() {
    //   try {
    //     const newAccessToken = await refreshAccessToken(this.refreshToken)
    //     // this.initTokenTimer(newAccessToken)
    //     return newAccessToken
    //   } catch (error) {
    //     console.error("Error refreshing access token:", error)
    //     // Выход пользователя из учетной записи или другие действия по вашему усмотрению
    //   }
    // },
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
