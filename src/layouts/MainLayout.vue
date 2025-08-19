<template>
  <n-dialog-provider>
    <n-loading-bar-provider>
      <left-nav class="left-navigation">
        <template #content>
          <main class="main-content__body" ref="mainContentBodyRef">
            <slot></slot>
          </main>
        </template>
      </left-nav>
    </n-loading-bar-provider>
  </n-dialog-provider>
</template>
<script setup lang="ts">
  import LeftNav from "@/layouts/LeftNav.vue"
</script>
