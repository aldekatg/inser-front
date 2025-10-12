<template>
  <div class="warehouse-component">
    <h1>Склад</h1>
    <div class="warehouse-component__actions">
      <n-button type="primary" @click="isModalOpen = true">
        Добавить склад
      </n-button>
    </div>
    <base-table
      :data="warehouses"
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
  <warehouse-modal
    :form="warehouseForm"
    :is-edit="!!warehouseForm.id"
    :model-value="isModalOpen"
    @cancel="closeModal"
    @save="saveWarehouse"
  />
</template>

<script setup lang="ts">
  import { onMounted } from "vue"
  import { useWarehouses } from "@/components/common/warehouses/useWarehouses.ts"
  import BaseTable from "@/components/base/BaseTable.vue"
  import { NButton } from "naive-ui"
  import WarehouseModal from "@/components/common/warehouses/WarehouseModal.vue"
  import { handleUpdateSorter } from "@/utils"

  const {
    loading,
    warehouses,
    warehouseForm,
    saveWarehouse,
    initWarehouses,
    isModalOpen,
    columns,
    closeModal,
    pagination,
    sortedFields,
  } = useWarehouses()

  const onPageChange = (page: number) => {
    pagination.value.page = page
    sortedFields.value.skip =
      pagination.value.per_page * pagination.value.page -
      pagination.value.per_page
    initWarehouses(sortedFields.value)
  }

  const onPageSizeChange = (pageSize: number) => {
    pagination.value.per_page = pageSize
    sortedFields.value.limit = pageSize
    pagination.value.page = 1
    sortedFields.value.skip = 0
    initWarehouses(sortedFields.value)
  }

  const sorterFunc = (sorter: {
    columnKey: string
    sorter: string
    order: string | null
  }) => handleUpdateSorter(sorter, initWarehouses, sortedFields.value)

  onMounted(() => initWarehouses(sortedFields.value))
</script>

<style scoped lang="scss">
  .warehouse-component {
    padding: rem(20);

    &__actions {
      margin: rem(20) 0;
    }
  }
</style>
