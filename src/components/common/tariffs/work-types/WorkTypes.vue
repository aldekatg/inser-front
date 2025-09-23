<template>
  <div class="jobs-component">
    <div class="jobs-component__actions">
      <n-button type="primary" @click="isModalOpen = true">
        Добавить вид работы
      </n-button>
    </div>
    <base-table
      :data="workTypes"
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
  <WorkTypeModal
    :form="workTypeForm"
    :is-edit="!!workTypeForm.id"
    :model-value="isModalOpen"
    @save="saveWorkType"
    @cancel="closeModal"
  />
</template>

<script setup lang="ts">
  import { onMounted } from "vue"
  import BaseTable from "@/components/base/BaseTable.vue"
  import { useWorkTypes } from "@/components/common/tariffs/work-types/useWorkTypes.ts"
  import { handleUpdateSorter } from "@/utils"
  import WorkTypeModal from "@/components/common/tariffs/work-types/WorkTypeModal.vue"

  const {
    workTypes,
    loading,
    workTypeForm,
    sortedFields,
    initWorkTypes,
    pagination,
    saveWorkType,
    isModalOpen,
    columns,
    closeModal,
  } = useWorkTypes()

  const onPageChange = (page: number) => {
    pagination.value.page = page
    sortedFields.value.skip =
      pagination.value.per_page * pagination.value.page -
      pagination.value.per_page
    initWorkTypes(sortedFields.value)
  }

  const sorterFunc = (sorter: {
    columnKey: string
    sorter: string
    order: string | null
  }) => handleUpdateSorter(sorter, initWorkTypes, sortedFields.value)

  onMounted(() => initWorkTypes())
</script>

<style scoped lang="scss">
  .jobs-component {
    padding: rem(20);

    &__actions {
      margin-bottom: rem(20);
    }
  }
</style>
