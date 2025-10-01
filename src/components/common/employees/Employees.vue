<template>
  <div class="employees-component">
    <h1>Сотрудники</h1>
    <div class="employees-component__actions">
      <NButton type="primary" @click="isModalOpen = true">
        Добавить сотрудника
      </NButton>
    </div>
    <base-table
      :data="employees"
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
  <EmployeeModal
    :form="employeeForm"
    :is-edit="!!employeeForm.id"
    :model-value="isModalOpen"
    @cancel="closeModal"
    @save="saveEmployee"
  />
</template>
<script setup lang="ts">
  import { onMounted } from "vue"
  import BaseTable from "@/components/base/BaseTable.vue"
  import { useEmployees } from "@/components/common/employees/useEmployees.ts"
  import EmployeeModal from "@/components/common/employees/EmployeeModal.vue"
  import { handleUpdateSorter } from "@/utils"

  const {
    employees,
    employeeForm,
    columns,
    loading,
    isModalOpen,
    pagination,
    sortedFields,
    initEmployees,
    closeModal,
    saveEmployee,
  } = useEmployees()

  const onPageChange = (page: number) => {
    pagination.value.page = page
    sortedFields.value.skip =
      pagination.value.per_page * pagination.value.page -
      pagination.value.per_page
    initEmployees(sortedFields.value)
  }

  const sorterFunc = (sorter: {
    columnKey: string
    sorter: string
    order: string | null
  }) => handleUpdateSorter(sorter, initEmployees, sortedFields.value)

  onMounted(() => initEmployees(sortedFields.value))
</script>

<style scoped lang="scss">
  .employees-component {
    padding: rem(20);

    &__actions {
      margin: rem(20) 0;
    }
  }
</style>
