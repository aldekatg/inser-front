<template>
  <div class="warehouse-component">
    <div class="warehouse-component__actions">
      <n-button type="primary" @click="isModalOpen = true">
        Добавить склад
      </n-button>
    </div>
    <base-table :data="warehouses" :columns="columns" />
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
    padding: rem(40);

    &__actions {
      margin-bottom: rem(20);
    }
  }
</style>
