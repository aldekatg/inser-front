import { ref } from "vue"
import type { FormInst, FormItemRule } from "naive-ui"
import { router } from "@/router/router.ts"
import { useAuthStore } from "@/store/useAuthStore.ts"

const { initAuth } = useAuthStore()

export const useAuth = () => {
  const message = useMessage()
  const formRef = ref<FormInst | null>(null)
  const formValue = ref({
    phone: "",
    password: "",
  })
  const loading = ref<boolean>(false)

  const rules = {
    phone: [
      {
        required: true,
        validator(_: FormItemRule, value: string) {
          if (!value) {
            return new Error("Обязательно для заполнения")
          }
          return true
        },
        trigger: ["input", "blur"],
      },
    ],
    password: {
      required: true,
      message: "Введите пароль!",
    },
  }

  const loginHandler = async (phone: string, password: string) => {
    loading.value = true
    console.log(phone, password)
    try {
      // const response = await authApi.login(
      //   phone
      //     .replace(/\s+/g, "")
      //     .replace("+", ""),
      //   password
      // )

      const response = await new Promise<{
        accessToken: string
        refreshToken: string
      }>((resolve) => {
        setTimeout(
          () =>
            resolve({
              accessToken: "tamirpedik",
              refreshToken: "erapedik",
            }),
          6000
        )
      })

      console.log(response)
      initAuth(response.accessToken, response.refreshToken)
      message.success("Вы успешно авторизованы!")
      await router.push("/")
      return response
    } catch (error) {
      console.error(error)
      message.error("Ошибка авторизации! Проверьте телефон и пароль.")
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loginHandler,
    rules,
    formRef,
    formValue,
    loading,
  }
}
