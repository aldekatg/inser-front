<template>
  <n-space vertical :size="12">
    <n-data-table
      :bordered="true"
      :single-line="true"
      :loading="props.loading"
      :columns="props.columns"
      :data="props.data"
      remote
      @update:sorter="$emit('update:sorter', $event)"
    />
  </n-space>
</template>
<script setup lang="ts">
  import { defineProps } from "vue"

  const props = defineProps<{
    data: any
    columns: any
    loading?: boolean
  }>()
</script>

<style scoped lang="scss">
  :deep(.custom-buttons) {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: rem(5);
  }

  :deep(.n-data-table .n-scrollbar-container) {
    max-height: calc(100vh - 220px); /* или 70vh чтобы занимало 70% экрана */
    overflow-y: auto; /* включаем скролл */
  }

  :deep(.n-data-table .n-data-table-table) {
    table-layout: fixed; /* чтобы колонки не «прыгали» */
  }
</style>
