<template>
  <div class="jobs-component">
    <h1>Технические задания</h1>
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
      :page-sizes="[10, 20, 30, 50, 100]"
      show-size-picker
      @update:page="onPageChange"
      @update:page-size="onPageSizeChange"
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

  const onPageSizeChange = (pageSize: number) => {
    pagination.value.per_page = pageSize
    sortedFields.value.limit = pageSize
    pagination.value.page = 1
    sortedFields.value.skip = 0
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
      margin: rem(20) 0;
    }
  }
</style>
