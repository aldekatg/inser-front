<template>
  <div class="confirm-qr">
    <div class="confirm-qr__container">
      <div class="confirm-qr__content">
        <div v-if="loading" class="confirm-qr__loading">
          <n-spin size="large" />
          <p>Обработка QR кода...</p>
        </div>

        <div v-else-if="error" class="confirm-qr__error">
          <n-result status="error" title="Ошибка" :description="error">
            <template #footer>
              <n-button @click="goHome">На главную</n-button>
            </template>
          </n-result>
        </div>

        <div v-else-if="success" class="confirm-qr__success">
          <n-result
            status="success"
            title="Успешно!"
            description="QR код подтвержден"
          >
            <template #footer>
              <n-button type="primary" @click="goToTickets">К заявкам</n-button>
            </template>
          </n-result>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from "vue"
  import { useRoute, useRouter } from "vue-router"
  import { useAuthStore } from "@/store/useAuthStore"
  import { confirmQRCode } from "@/api/tickets"
  import { NSpin, NResult, NButton } from "naive-ui"

  const route = useRoute()
  const router = useRouter()
  const { isUserAuthorized } = useAuthStore()

  const loading = ref(true)
  const error = ref("")
  const success = ref(false)

  const processQRCode = async () => {
    try {
      const guid = route.query.guid as string
      const id = route.query.id as string

      if (!guid) {
        error.value = "Не указан GUID в параметрах"
        return
      }

      // Проверяем авторизацию
      if (!isUserAuthorized) {
        // Сохраняем GUID в sessionStorage для последующего использования
        sessionStorage.setItem("pendingQRGuid", JSON.stringify({ guid, id }))
        // Перенаправляем на страницу авторизации
        router.push("/auth")
        return
      }

      // Если авторизован, сразу подтверждаем QR код
      await confirmQRCode(id, guid)
      success.value = true
    } catch (err: any) {
      console.error("Ошибка при подтверждении QR кода:", err)
      error.value =
        err.response?.data?.message ||
        "Произошла ошибка при подтверждении QR кода"
    } finally {
      loading.value = false
    }
  }

  const goHome = () => {
    router.push("/")
  }

  const goToTickets = () => {
    router.push("/tickets")
  }

  onMounted(() => {
    processQRCode()
  })
</script>

<style lang="scss" scoped>
  .confirm-qr {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--n-color);

    &__container {
      max-width: 500px;
      width: 100%;
      padding: rem(20);
    }

    &__content {
      text-align: center;
    }

    &__loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: rem(16);

      p {
        margin: 0;
        color: var(--n-text-color);
        font-size: rem(16);
      }
    }

    &__error,
    &__success {
      .n-result {
        padding: rem(20);
      }
    }
  }
</style>
