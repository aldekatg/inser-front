<template>
  <div class="companies-component">
    <div class="companies-component__actions">
      <NButton type="primary" @click="isModalOpen = true">
        Добавить компанию
      </NButton>
    </div>
    <base-table :data="companies" :columns="columns" />
  </div>
  <CompanyModal
    :form="companyForm"
    :is-edit="!!companyForm.id"
    :model-value="isModalOpen"
    @save="saveCompany"
    @cancel="closeModal"
  />
</template>
<script setup lang="ts">
  import { onMounted } from "vue"
  import BaseTable from "@/components/base/BaseTable.vue"
  import { useCompanies } from "@/components/common/companies/useCompanies.ts"
  import CompanyModal from "@/components/common/companies/CompanyModal.vue"

  const {
    companies,
    companyForm,
    saveCompany,
    initCompanies,
    isModalOpen,
    columns,
    closeModal,
  } = useCompanies()

  onMounted(() => initCompanies())
</script>

<style scoped lang="scss">
  .companies-component {
    padding: rem(40);

    &__actions {
      margin-bottom: rem(20);
    }
  }
</style>
