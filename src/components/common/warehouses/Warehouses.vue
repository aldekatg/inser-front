<template>
  <div class="warehouse-component">
    <h1>Склад</h1>
    <div class="warehouse-component__actions">
      <n-button type="primary" @click="isModalOpen = true">
        Добавить склад
      </n-button>
    </div>
    <base-table :data="warehouses" :columns="columns" :loading="loading" />
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

  const {
    loading,
    warehouses,
    warehouseForm,
    saveWarehouse,
    initWarehouses,
    isModalOpen,
    columns,
    closeModal,
  } = useWarehouses()

  onMounted(() => initWarehouses())
</script>

<style scoped lang="scss">
  .warehouse-component {
    padding: rem(20);

    &__actions {
      margin: rem(20) 0;
    }
  }
</style>
