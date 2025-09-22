<template>
  <div class="gas-stations-component">
    <div class="gas-stations-component__actions">
      <NButton type="primary" @click="isModalOpen = true">Добавить АЗС</NButton>
    </div>
    <BaseTable
      :data="gasStations"
      :columns="columns"
      :loading="loading"
      @update:sorter="sorterFunc"
    />
    <NPagination
      class="pagination"
      :page="pagination.page"
      :item-count="pagination.total"
      :page-size="pagination.per_page"
      @update:page="onPageChange"
      show-quick-jumper
    />
  </div>
  <GasStationModal
    :is-edit="!!gasStationForm.id"
    :model-value="isModalOpen"
    :form="gasStationForm"
    @save="saveGasStation"
    @cancel="closeModal"
  />
</template>

<script setup lang="ts">
  import { onMounted } from "vue"
  import { useGasStations } from "@/components/common/gas-stations/useGasStations.ts"
  import BaseTable from "@/components/base/BaseTable.vue"
  import { NButton } from "naive-ui"
  import GasStationModal from "@/components/common/gas-stations/GasStationModal.vue"
  import { handleUpdateSorter } from "@/utils"

  const {
    loading,
    columns,
    closeModal,
    pagination,
    gasStations,
    isModalOpen,
    sortedFields,
    gasStationForm,
    saveGasStation,
    initGasStations,
  } = useGasStations()

  const onPageChange = (page: number) => {
    pagination.value.page = page
    sortedFields.value.skip =
      pagination.value.per_page * pagination.value.page -
      pagination.value.per_page
    initGasStations(sortedFields.value)
  }

  const sorterFunc = (sorter: {
    columnKey: string
    sorter: string
    order: string | null
  }) => handleUpdateSorter(sorter, initGasStations, sortedFields.value)

  onMounted(() => initGasStations())
</script>

<style scoped lang="scss">
  :deep(.n-data-table .n-scrollbar-container) {
    max-height: calc(100vh - 220px); /* или 70vh чтобы занимало 70% экрана */
    overflow-y: auto; /* включаем скролл */
  }

  :deep(.n-data-table .n-data-table-table) {
    table-layout: fixed; /* чтобы колонки не «прыгали» */
  }

  .pagination {
    margin-top: rem(20);
    display: flex;
    justify-content: flex-end;
  }

  .gas-stations-component {
    padding: rem(20);

    &__actions {
      margin-bottom: rem(20);
    }
  }
</style>
