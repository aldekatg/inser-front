<template>
  <BaseTreeSelect
    v-if="!!technical_tasks"
    :edit-mode="isEditMode"
    :source="technical_tasks"
    :preselected="preselected"
    @update:selected-keys="emit('update:selectedKeys', $event)"
  />
</template>
<script setup lang="ts">
  import BaseTreeSelect from "@/components/base/BaseTreeSelect.vue"
  import { storeToRefs } from "pinia"
  import { useDictionaryStore } from "@/store/useDictionary.ts"
  import { TechnicalTaskDetail } from "@/api/tickets/types.ts"

  const dictionaryStore = useDictionaryStore()

  const { preselected, isEditMode } = defineProps<{
    preselected?: TechnicalTaskDetail[]
    isEditMode?: boolean
  }>()

  const emit = defineEmits<{
    (e: "update:selectedKeys", data: TechnicalTaskDetail[]): void
  }>()

  const { technical_tasks } = storeToRefs(dictionaryStore)

  onMounted(async () => {
    if (!technical_tasks.value?.length) await dictionaryStore.initDictionary()
  })
</script>
