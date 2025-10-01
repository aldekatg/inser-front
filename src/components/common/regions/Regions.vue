<template>
  <div class="region-component">
    <h1>Регионы</h1>
    <div class="region-component__actions">
      <n-button type="primary" @click="isModalOpen = true">
        Добавить регион
      </n-button>
    </div>
    <base-table :data="regions" :columns="columns" :loading="loading" />
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

  const {
    regions,
    loading,
    regionsForm,
    initRegions,
    saveRegion,
    isModalOpen,
    columns,
    closeModal,
  } = useRegions()

  onMounted(() => initRegions())
</script>

<style scoped lang="scss">
  .region-component {
    padding: rem(20);

    &__actions {
      margin: rem(20) 0;
    }
  }
</style>
