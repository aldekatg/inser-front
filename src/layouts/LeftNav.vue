<template>
  <div style="height: 100vh; position: relative">
    <n-layout position="absolute">
      <n-layout-header style="height: 70px" bordered embedded>
        <n-space
          justify="space-between"
          align="center"
          style="padding: 0 22px 0 22px"
        >
          <n-space>
            <n-image src="/logo.svg" :height="64" />
          </n-space>
          <n-space>
            <n-dropdown :options="options">
              <n-button size="large" round>
                <template #icon>
                  <n-icon><person-circle-icon /></n-icon>
                </template>
                {{ EmployeeRoles[authStore.user?.role] }}
              </n-button>
            </n-dropdown>
          </n-space>
        </n-space>
      </n-layout-header>
      <n-layout has-sider position="absolute" style="top: 70px">
        <n-layout-sider
          bordered
          collapse-mode="width"
          :collapsed-width="64"
          :width="260"
          :collapsed="collapsed"
          show-trigger
          class="slider-custom"
          @collapse="collapsed = true"
          @expand="collapsed = false"
        >
          <n-menu
            :router="true"
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :collapsed="collapsed"
            :options="menuOptions"
          />
        </n-layout-sider>
        <n-layout ref="mainContentBodyRef" @scroll="onScrollHandler">
          <slot name="content"></slot>
        </n-layout>
      </n-layout>
    </n-layout>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, provide } from "vue"
  import { useRoute } from "vue-router"
  import { NIcon, LayoutInst } from "naive-ui"

  // icons
  import { PersonCircleOutline as PersonCircleIcon } from "@vicons/ionicons5"

  // helpers
  import { useNavHook } from "@/layouts/composables/useNavHook.ts"
  import { storeToRefs } from "pinia"
  import { useAuthStore } from "@/store/useAuthStore.ts"
  import { EmployeeRoles } from "../api/employees/types.ts"

  const authStore = useAuthStore()
  const { menuOptions, options } = useNavHook()
  const collapsed = ref(false)

  // const contentRef = ref<LayoutInst | null>(null)
  const mainContentBodyRef = ref<LayoutInst | null>(null)
  const route = useRoute()

  watch(
    () => route.path,
    (newRoute: any) => {
      console.log(newRoute)
      mainContentBodyRef.value?.scrollTo({ top: 0 })
    }
  )

  // Передаю информацию о позиции скролла через provide/inject
  const scrollTopRef = ref(0)

  provide("layoutScrollTop", scrollTopRef)
  provide("mainContentBodyRef", mainContentBodyRef)

  function onScrollHandler(event: Event) {
    const element = event.target as HTMLElement
    scrollTopRef.value = element.scrollTop
  }
</script>
<style lang="scss" scoped>
  :deep(
    .n-menu
      .n-menu-item-content.n-menu-item-content--selected
      .n-menu-item-content__icon
  ) {
    color: #0085ff !important;
  }
  :deep(
    .n-menu-item-content:not(
        .n-menu-item-content--disabled
      ).n-menu-item-content--selected
      .n-menu-item-content-header
      a
  ) {
    color: #0085ff !important;
  }
  :deep(
    .n-menu-item-content:not(
        .n-menu-item-content--disabled
      ).n-menu-item-content--selected::before
  ) {
    background-color: #0085ff1a;
  }
  :deep(
    .n-menu-item-content:not(
        .n-menu-item-content--disabled
      ).n-menu-item-content--selected:hover::before
  ) {
    background-color: #0085ff1a;
  }
  :deep(.n-menu-item) {
    margin-top: 12px !important;
  }
</style>
