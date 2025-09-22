import axios from "axios"
// import { ref } from "vue"
import { config } from "@/config/config"
// import { useAuthStore } from "@/store/useAuthStore"
// import { refreshAccessToken } from "@/api/auth"

export const api = axios.create({
  baseURL: config.BACKEND_URL,
})

api.interceptors.request.use(
  (config) => {
    if (config?.url === "/auth") {
      return config
    } else {
      const dwToken = localStorage.getItem("token")
      if (dwToken) config.headers.Authorization = `Bearer ${dwToken}`
      return config
    }
  },
  (response) => {
    console.log(response)
  }
)

// const isRefreshing = ref(false)

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const {
//       config,
//       response: { status },
//     } = error
//     const originalRequest = config
//
//     const authStore = useAuthStore()
//     console.log("original request", originalRequest)
//     if (status === 401) {
//       if (!isRefreshing.value) {
//         isRefreshing.value = true
//
//         const refreshToken = localStorage.getItem("refreshToken")
//         try {
//           const response = await refreshAccessToken(refreshToken)
//           authStore.initAuth(
//             response.data.accessToken,
//             response.data.refreshToken
//           )
//           originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
//           return api(originalRequest)
//         } catch (err) {
//           console.log(err)
//           await authStore.logOut()
//           return Promise.reject(error)
//         } finally {
//           isRefreshing.value = false
//         }
//       } else {
//         return Promise.reject(error)
//       }
//     }
//     return Promise.reject(error)
//   }
// )

export const objectToUrlParams = (params: any) =>
  `?${Object.keys(params)
    .map((key) => {
      if (
        (Array.isArray(params[key]) && params[key].length === 0) ||
        params[key] === null ||
        params[key] === undefined ||
        params[key] === ""
      )
        return
      if (typeof params[key] === "boolean") {
        return `${encodeURIComponent(key)}=${params[key] ? "true" : "false"}`
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    })
    .filter((item) => item !== null && item !== undefined)
    .join("&")}`

export default { api, objectToUrlParams }
