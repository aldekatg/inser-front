<template>
  <n-space vertical :size="12">
    <n-data-table
      :bordered="true"
      :single-line="true"
      :columns="props.columns"
      :data="props.data"
      :pagination="props.pagination"
    />
  </n-space>
</template>
<script setup lang="ts">
  import { defineProps } from "vue"

  const props = defineProps<{
    data: any
    columns: any
    pagination?: any
  }>()
</script>

<style scoped lang="scss">
  :deep(.custom-buttons) {
    display: flex;
    flex-direction: row;
    gap: rem(5);
  }
</style>
