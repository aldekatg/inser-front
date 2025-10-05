<template>
  <div class="tickets-component">
    <div class="tickets-component__actions">
      <h1>Заявки</h1>
      <NButton type="primary" @click="createNewTicket">Добавить заявку</NButton>
    </div>

    <n-tabs type="segment" animated @update:value="changeSource">
      <n-tab-pane name="customer_call" tab="Сервисные">
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
      </n-tab-pane>
      <n-tab-pane name="planned" tab="Плановые">
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
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from "vue"
  import { useTickets } from "@/components/common/tickets/useTickets.ts"
  import BaseTable from "@/components/base/BaseTable.vue"
  import { useRouter } from "vue-router"

  const router = useRouter()
  const sourceType = ref<"planned" | "customer_call">("customer_call")

  const { data, columns, pagination, sortedFields, loading, initTickets } =
    useTickets()

  const onPageChange = (page: number) => {
    pagination.value.page = page
    sortedFields.value.skip =
      pagination.value.per_page * pagination.value.page -
      pagination.value.per_page
    initTickets(sortedFields.value)
  }

  function changeSource(value: "planned" | "customer_call") {
    sourceType.value = value
    pagination.value.page = 1
    sortedFields.value.skip = 0
    sortedFields.value.ticket_type = value
    initTickets(sortedFields.value)
  }

  const createNewTicket = () => {
    router.push({ name: "TicketCreate" })
  }

  onMounted(() => initTickets(sortedFields.value))
</script>

<style scoped lang="scss">
  :deep(.tz-style) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: rem(10);
  }

  .tickets-component {
    padding: rem(20);

    &__header {
      display: flex;
      align-items: flex-start;
      gap: rem(15);
      margin-bottom: rem(20);
    }

    &__actions {
      display: flex;
      align-items: stat;
      justify-content: space-between;
      margin: rem(20) 0;
    }
  }

  :deep(.n-data-table .n-data-table-tr) {
    white-space: nowrap;
  }
</style>
