<template>
  <n-message-provider>
    <n-config-provider :date-locale="dateRuRU" :locale="ruRU">
      <router-view />
    </n-config-provider>
  </n-message-provider>
</template>

<script setup lang="ts">
  import { ruRU, dateRuRU } from "naive-ui"
  import { useAuthStore } from "@/store/useAuthStore.ts"
  import { useDictionaryStore } from "@/store/useDictionary.ts"

  const authStore = useAuthStore()
  const dictionaryStore = useDictionaryStore()

  const token = localStorage.getItem("token")
  const refreshToken = localStorage.getItem("refreshToken")
  authStore.initAuth(token as string, refreshToken as string)

  onMounted(() => {
    dictionaryStore.initDictionary()
  })
</script>

<style scoped></style>
