<template>
  <div class="burger-menu">
    <!-- Burger Button -->
    <n-button circle size="large" @click="toggleMenu" class="burger-button">
      <template #icon>
        <n-icon :size="24">
          <MenuIcon v-if="!isOpen" />
          <CloseIcon v-else />
        </n-icon>
      </template>
    </n-button>

    <!-- Overlay -->
    <div v-if="isOpen" class="burger-overlay" @click="closeMenu" />

    <!-- Menu Panel -->
    <div class="burger-panel" :class="{ 'burger-panel--open': isOpen }">
      <!-- Header -->
      <div class="burger-header">
        <n-image src="/logo.jpg" alt="Logo of company" :height="40" />
        <n-button quaternary circle size="small" @click="closeMenu">
          <template #icon>
            <n-icon><CloseIcon /></n-icon>
          </template>
        </n-button>
      </div>

      <!-- Menu Items -->
      <div class="burger-content">
        <n-menu
          :router="true"
          :options="menuOptions"
          :value="activeKey"
          @update:value="closeMenu"
        />
      </div>

      <!-- User Info -->
      <div class="burger-footer">
        <n-dropdown :options="options" trigger="click">
          <n-button size="large" round class="user-button">
            <template #icon>
              <n-icon><PersonCircleIcon /></n-icon>
            </template>
            {{ authStore.user?.name }}
          </n-button>
        </n-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from "vue"
  import { useRoute } from "vue-router"
  import { NIcon } from "naive-ui"

  // Icons
  import {
    MenuOutline as MenuIcon,
    CloseOutline as CloseIcon,
    PersonCircleOutline as PersonCircleIcon,
  } from "@vicons/ionicons5"

  // Helpers
  import { useNavHook } from "@/layouts/composables/useNavHook.ts"
  import { useAuthStore } from "@/store/useAuthStore.ts"

  const authStore = useAuthStore()
  const { menuOptions, options } = useNavHook()
  const route = useRoute()

  const isOpen = ref(false)
  const activeKey = ref<string | null>(null)

  // Watch route changes
  watch(
    () => route.name,
    (name) => {
      activeKey.value = (name as string) ?? null
    },
    { immediate: true }
  )

  // Watch route path changes
  watch(
    () => route.path,
    () => {
      closeMenu()
    }
  )

  function toggleMenu() {
    isOpen.value = !isOpen.value
  }

  function closeMenu() {
    isOpen.value = false
  }
</script>

<style lang="scss" scoped>
  .burger-menu {
    position: relative;
    z-index: 1000;
  }

  .burger-button {
    position: fixed;
    top: rem(16);
    left: rem(16);
    z-index: 1001;
    background-color: white !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--n-border-color);

    &:hover {
      background-color: var(--n-color-hover) !important;
    }
  }

  .burger-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  .burger-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: rem(280);
    height: 100vh;
    background-color: white;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;

    &--open {
      transform: translateX(0);
    }
  }

  .burger-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: rem(16);
    border-bottom: 1px solid var(--n-border-color);

    :deep(.n-button) {
      background-color: transparent !important;
      border: none !important;

      &:hover {
        background-color: var(--n-color-hover) !important;
      }
    }
  }

  .burger-content {
    flex: 1;
    padding: rem(16) 0;
    overflow-y: auto;
  }

  .burger-footer {
    padding: rem(16);
    border-top: 1px solid var(--n-border-color);
  }

  .user-button {
    width: 100%;
    background-color: var(--n-color) !important;
    border: 1px solid var(--n-border-color) !important;

    &:hover {
      background-color: var(--n-color-hover) !important;
    }

    :deep(.n-button__content) {
      white-space: normal;
      color: var(--n-text-color);
    }
  }

  // Menu styles
  :deep(.n-menu) {
    background-color: transparent;
  }

  :deep(.n-menu-item-content) {
    color: var(--n-text-color) !important;

    &:hover {
      background-color: var(--n-color-hover);
    }
  }

  :deep(.n-menu-item-content--selected) {
    color: #0085ff !important;
    background-color: #0085ff1a;
  }

  :deep(.n-menu-item-content--selected::before) {
    background-color: #0085ff1a;
  }

  :deep(.n-menu-item) {
    margin: rem(4) rem(16);
  }
</style>
