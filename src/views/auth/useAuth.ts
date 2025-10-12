import { ref, onMounted } from "vue"
import type { FormInst } from "naive-ui"
import { useAuthStore } from "@/store/useAuthStore.ts"
import { login } from "@/api/auth"
import { regEmail } from "@/components/common/gas-stations/const.ts"
import { useRouter } from "vue-router"

const { initAuth } = useAuthStore()

export const useAuth = () => {
  const message = useMessage()
  const router = useRouter()
  const formRef = ref<FormInst | null>(null)
  const formValue = ref({
    mail: "",
    password: "",
  })
  const loading = ref<boolean>(false)
  const rememberMe = ref<boolean>(false)

  const rules = {
    mail: {
      required: true,
      type: "email",
      message: "Email обязателен",
      validator(_: unknown, value: string) {
        console.log(_)
        if (value && !regEmail.test(value)) {
          return new Error("Введите верный формат email")
        }
      },
      trigger: ["blur", "input"],
    },
    password: {
      required: true,
      message: "Введите пароль!",
    },
  }

  // Загрузка сохраненных данных при монтировании
  onMounted(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    const savedPassword = localStorage.getItem("rememberedPassword")
    const savedRemember = localStorage.getItem("rememberMe")

    if (savedEmail && savedPassword && savedRemember === "true") {
      formValue.value.mail = savedEmail
      formValue.value.password = savedPassword
      rememberMe.value = true
    }
  })

  const loginHandler = async (email: string, password: string) => {
    loading.value = true
    console.log(email, password)
    try {
      const response = await login(email, password)

      if (!response || response.status === "error") {
        throw new Error("No access token in response")
      }

      // Сохранение или удаление данных в зависимости от чекбокса
      if (rememberMe.value) {
        localStorage.setItem("rememberedEmail", email)
        localStorage.setItem("rememberedPassword", password)
        localStorage.setItem("rememberMe", "true")
      } else {
        localStorage.removeItem("rememberedEmail")
        localStorage.removeItem("rememberedPassword")
        localStorage.removeItem("rememberMe")
      }

      initAuth(response.payload.access_token, response.payload.refresh_token)
      message.success("Вы успешно авторизованы!")

      // Проверяем наличие pending QR GUID
      const pendingQRGuid = sessionStorage.getItem("pendingQRGuid")
      if (pendingQRGuid) {
        const { guid, id } = JSON.parse(pendingQRGuid)
        sessionStorage.removeItem("pendingQRGuid")
        await router.push(`/confirmQR?guid=${guid}&id=${id}`)
      } else {
        await router.push("/")
      }
    } catch (error) {
      message.error("Ошибка авторизации! Проверьте почту и пароль.")
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
    rememberMe,
  }
}
