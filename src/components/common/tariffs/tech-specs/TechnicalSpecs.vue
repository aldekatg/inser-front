<template>
  <div class="jobs-component">
    <div class="jobs-component__actions">
      <n-button type="primary" @click="isModalOpen = true">
        Добавить техническое задание
      </n-button>
    </div>
    <base-table
      :data="techTasks"
      :columns="columns"
      :loading="loading"
      @update:sorter="sorterFunc"
    />
    <NPagination
      v-if="!loading"
      class="pagination"
      :page="pagination.page"
      :item-count="pagination.total"
      :page-size="pagination.per_page"
      @update:page="onPageChange"
      show-quick-jumper
    />
  </div>
  <TechnicalSpecsModal
    :form="techTaskForm"
    :is-edit="!!techTaskForm.id"
    :model-value="isModalOpen"
    @save="saveTechTask"
    @cancel="closeModal"
  />
</template>

<script setup lang="ts">
  import { onMounted } from "vue"
  import BaseTable from "@/components/base/BaseTable.vue"
  import { handleUpdateSorter } from "@/utils"
  import { useTechSpecs } from "@/components/common/tariffs/tech-specs/useTechSpecs.ts"
  import TechnicalSpecsModal from "@/components/common/tariffs/tech-specs/TechnicalSpecsModal.vue"

  const {
    techTasks,
    loading,
    techTaskForm,
    sortedFields,
    initTechTasks,
    pagination,
    saveTechTask,
    isModalOpen,
    columns,
    closeModal,
  } = useTechSpecs()

  const onPageChange = (page: number) => {
    pagination.value.page = page
    sortedFields.value.skip =
      pagination.value.per_page * pagination.value.page -
      pagination.value.per_page
    initTechTasks(sortedFields.value)
  }

  const sorterFunc = (sorter: {
    columnKey: string
    sorter: string
    order: string | null
  }) => handleUpdateSorter(sorter, initTechTasks, sortedFields.value)

  onMounted(() => initTechTasks())
</script>

<style scoped lang="scss">
  .jobs-component {
    padding: rem(20);

    &__actions {
      margin-bottom: rem(20);
    }
  }
</style>
