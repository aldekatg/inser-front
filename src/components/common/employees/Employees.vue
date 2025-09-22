<template>
  <div class="employees-component">
    <div class="employees-component__actions">
      <NButton type="primary" @click="isModalOpen = true">
        Добавить сотрудника
      </NButton>
    </div>
    <base-table :data="employees" :columns="columns" :loading="loading" />
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

  const {
    employees,
    employeeForm,
    columns,
    loading,
    isModalOpen,
    initEmployees,
    closeModal,
    saveEmployee,
  } = useEmployees()

  onMounted(() => initEmployees())
</script>

<style scoped lang="scss">
  .employees-component {
    padding: rem(20);

    &__actions {
      margin-bottom: rem(20);
    }
  }
</style>
