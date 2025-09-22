import { api } from "@/api"
import { Response } from "@/types.ts"
import { AuthPayload } from "@/api/auth/type.ts"

const URLS = {
  login: "/auth/employee/login",
}

export function refreshAccessToken(refreshToken: string) {
  console.log(refreshToken)
  return new Promise((resolve, _) => {
    setTimeout(() => resolve, 5000)
  })
}

export const login = (email: string, password: string) =>
  api
    .post<Response<AuthPayload>>(URLS.login, { email, password })
    .then((resp) => resp.data)
