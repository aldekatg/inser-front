import { api } from "@/api"
import { Response } from "@/types.ts"
import { AuthPayload } from "@/api/auth/type.ts"

const URLS = {
  login: "/auth/employee/login",
}

export async function refreshAccessToken(refreshToken: string) {
  return api
    .post<Response<AuthPayload>>(URLS.login, { refreshToken })
    .then((resp) => resp.data)
}
export const login = (email: string, password: string) =>
  api
    .post<Response<AuthPayload>>(URLS.login, { email, password })
    .then((resp) => resp.data)
