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
    gap: rem(5);
  }
</style>
