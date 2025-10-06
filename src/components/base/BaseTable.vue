<template>
  <n-space vertical :size="12">
    <n-data-table
      :bordered="bordered"
      :single-line="singleLine"
      :loading="loading"
      :columns="columns"
      :data="data"
      :striped="striped"
      :hoverable="hoverable"
      :row-class-name="rowClassName"
      :row-key="rowKey"
      :scroll-x="scrollX"
      :max-height="maxHeight"
      remote
      @update:sorter="$emit('update:sorter', $event)"
    />
  </n-space>
</template>
<script setup lang="ts">
  import { defineProps } from "vue"

  const {
    data,
    columns,
    loading = false,
    singleLine = true,
    bordered = true,
    striped = false,
    hoverable = false,
    rowClassName,
    rowKey,
    scrollX,
    maxHeight,
  } = defineProps<{
    rowClassName?: (row: any) => string
    data: any
    columns: any
    loading?: boolean
    singleLine?: boolean
    bordered?: boolean
    striped?: boolean
    hoverable?: boolean
    rowKey?: (row: any) => string | number
    scrollX?: number | string
    maxHeight?: number | string
  }>()
</script>

<style scoped lang="scss">
  :deep(.n-data-table td) {
    max-height: rem(60);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

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
