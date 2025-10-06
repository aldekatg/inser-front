<template>
  <div class="gas-stations-component">
    <h1>АЗС</h1>
    <div class="gas-stations-component__actions">
      <NButton type="primary" @click="isModalOpen = true">Добавить АЗС</NButton>
    </div>
    <BaseTable
      scroll-x="800px"
      :data="gasStations"
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

  onMounted(() => initGasStations(sortedFields.value))
</script>

<style scoped lang="scss">
  .gas-stations-component {
    padding: rem(20);

    &__actions {
      margin: rem(20) 0;
    }
  }
</style>
