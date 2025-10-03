<template>
  <div class="tickets-component">
    <h1>Заявки</h1>
    <div class="tickets-component__actions">
      <NButton type="primary" @click="createNewTicket">Добавить заявку</NButton>
    </div>
    <base-table
      :data="data"
      :single-line="false"
      :loading="loading"
      :columns="columns"
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
</template>

<script lang="ts" setup>
  import { onMounted } from "vue"
  import { useTickets } from "@/components/common/tickets/useTickets.ts"
  import BaseTable from "@/components/base/BaseTable.vue"
  import { useRouter } from "vue-router"

  const router = useRouter()

  const { data, columns, pagination, sortedFields, loading, initTickets } =
    useTickets()

  const onPageChange = (page: number) => {
    pagination.value.page = page
    sortedFields.value.skip =
      pagination.value.per_page * pagination.value.page -
      pagination.value.per_page
    initTickets(sortedFields.value)
  }

  const createNewTicket = () => {
    router.push({ name: "TicketCreate" })
  }

  onMounted(() => initTickets(sortedFields.value))
</script>

<style scoped lang="scss">
  .tickets-component {
    padding: rem(20);

    &__header {
      display: flex;
      align-items: flex-start;
      gap: rem(15);
      margin-bottom: rem(20);
    }

    &__actions {
      margin: rem(20) 0;
    }
  }

  :deep(.n-data-table .n-data-table-tr) {
    white-space: nowrap;
  }
</style>
