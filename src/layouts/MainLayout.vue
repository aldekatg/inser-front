<template>
  <n-dialog-provider>
    <n-loading-bar-provider>
      <!-- Desktop Layout -->
      <left-nav v-if="!isMobile" class="left-navigation">
        <template #content>
          <main class="main-content__body" ref="mainContentBodyRef">
            <slot></slot>
          </main>
        </template>
      </left-nav>

      <!-- Mobile Layout -->
      <div v-else class="mobile-layout">
        <burger-menu />
        <main class="mobile-content" ref="mainContentBodyRef">
          <slot></slot>
        </main>
      </div>
    </n-loading-bar-provider>
  </n-dialog-provider>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue"
  import LeftNav from "@/layouts/LeftNav.vue"
  import BurgerMenu from "@/components/common/BurgerMenu.vue"

  const isMobile = ref(false)
  const mainContentBodyRef = ref<HTMLElement | null>(null)

  function checkIsMobile() {
    isMobile.value = window.innerWidth <= 768
  }

  onMounted(() => {
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
  })

  onUnmounted(() => {
    window.removeEventListener("resize", checkIsMobile)
  })
</script>

<style lang="scss" scoped>
  .mobile-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .mobile-content {
    flex: 1;
    padding: rem(60) rem(16) rem(16);
    overflow-y: auto;
    background-color: var(--n-color);
  }

  .left-navigation {
    height: 100vh;
  }
</style>
