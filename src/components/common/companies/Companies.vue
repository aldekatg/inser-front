<template>
  <div class="companies-component">
    <h1>Компании</h1>
    <div class="companies-component__actions">
      <NButton type="primary" @click="isModalOpen = true">
        Добавить компанию
      </NButton>
    </div>
    <base-table
      :data="companies"
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
  import { handleUpdateSorter } from "@/utils"

  const {
    companies,
    companyForm,
    loading,
    saveCompany,
    initCompanies,
    sortedFields,
    pagination,
    isModalOpen,
    columns,
    closeModal,
  } = useCompanies()

  const onPageChange = (page: number) => {
    pagination.value.page = page
    sortedFields.value.skip =
      pagination.value.per_page * pagination.value.page -
      pagination.value.per_page
    initCompanies(sortedFields.value)
  }

  const sorterFunc = (sorter: {
    columnKey: string
    sorter: string
    order: string | null
  }) => handleUpdateSorter(sorter, initCompanies, sortedFields.value)

  onMounted(() => initCompanies(sortedFields.value))
</script>

<style scoped lang="scss">
  .companies-component {
    padding: rem(20);

    &__actions {
      margin: rem(20) 0;
    }
  }
</style>
