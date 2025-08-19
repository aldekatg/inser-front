<template>
  <n-message-provider>
    <router-view />
  </n-message-provider>
</template>

<script setup lang="ts">
  import { useAuthStore } from "@/store/useAuthStore.ts"

  const authStore = useAuthStore()

  const token = localStorage.getItem("token")
  const refreshToken = localStorage.getItem("refreshToken")
  authStore.initAuth(token as string, refreshToken as string)
</script>

<style scoped></style>
