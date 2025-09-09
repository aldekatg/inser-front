<template>
  <div class="gas-stations-component">
    <div class="gas-stations-component__actions">
      <NButton type="primary" @click="isModalOpen = true">Добавить АЗС</NButton>
    </div>
    <BaseTable :data="gasStations" :columns="columns" />
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

  const {
    gasStations,
    gasStationForm,
    saveGasStation,
    initGasStations,
    isModalOpen,
    columns,
    closeModal,
  } = useGasStations()

  onMounted(() => initGasStations())
</script>

<style scoped lang="scss">
  .gas-stations-component {
    padding: rem(40);

    &__actions {
      margin-bottom: rem(20);
    }
  }
</style>
