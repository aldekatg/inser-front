<template>
  <div class="region-component">
    <h1>Регионы</h1>
    <div class="region-component__actions">
      <n-button type="primary" @click="isModalOpen = true">
        Добавить регион
      </n-button>
    </div>
    <base-table
      :data="regions"
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
  <RegionsModal
    :form="regionsForm"
    :is-edit="!!regionsForm.id"
    :model-value="isModalOpen"
    @save="saveRegion"
    @cancel="closeModal"
  />
</template>

<script setup lang="ts">
  import { onMounted } from "vue"
  import BaseTable from "@/components/base/BaseTable.vue"
  import { useRegions } from "@/components/common/regions/useRegions.ts"
  import RegionsModal from "@/components/common/regions/RegionsModal.vue"
  import { handleUpdateSorter } from "@/utils"

  const {
    regions,
    loading,
    regionsForm,
    initRegions,
    saveRegion,
    isModalOpen,
    columns,
    closeModal,
    pagination,
    sortedFields,
  } = useRegions()

  const onPageChange = (page: number) => {
    pagination.value.page = page
    sortedFields.value.skip =
      pagination.value.per_page * pagination.value.page -
      pagination.value.per_page
    initRegions(sortedFields.value)
  }

  const onPageSizeChange = (pageSize: number) => {
    pagination.value.per_page = pageSize
    sortedFields.value.limit = pageSize
    pagination.value.page = 1
    sortedFields.value.skip = 0
    initRegions(sortedFields.value)
  }

  const sorterFunc = (sorter: {
    columnKey: string
    sorter: string
    order: string | null
  }) => handleUpdateSorter(sorter, initRegions, sortedFields.value)

  onMounted(() => initRegions(sortedFields.value))
</script>

<style scoped lang="scss">
  .region-component {
    padding: rem(20);

    &__actions {
      margin: rem(20) 0;
    }
  }
</style>
