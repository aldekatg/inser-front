<template>
  <div class="tickets-component">
    <!-- Header Section -->
    <header class="tickets-component__header">
      <h1 class="tickets-component__title">Заявки</h1>
      <n-button type="primary" @click="navigateToCreate" :loading="loading">
        Добавить заявку
      </n-button>
    </header>

    <!-- Tabs Section -->
    <n-tabs
      v-model:value="currentTabType"
      type="segment"
      animated
      @update:value="changeTicketType"
      class="tickets-component__tabs"
    >
      <n-tab-pane
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        :tab="tab.label"
      >
        <template #tab>
          <div class="tab-content">
            <span>{{ tab.label }}</span>
            <n-tooltip v-if="tab.description" trigger="hover">
              <template #trigger>
                <n-icon :size="14" class="tab-icon">
                  <InfoIcon />
                </n-icon>
              </template>
              {{ tab.description }}
            </n-tooltip>
          </div>
        </template>

        <!-- Filters Section -->
        <ticket-filters
          v-model:filters="filters"
          :loading="loading"
          @apply="applyFilters"
        />

        <!-- Table Section -->
        <div class="tickets-component__table-container">
          <base-table
            :data="data"
            :columns="columns"
            :loading="loading"
            :single-line="false"
            :bordered="false"
            :striped="true"
            :hoverable="true"
            :row-key="(row: any) => row.id"
            class="tickets-table"
          />
        </div>

        <!-- Pagination Section -->
        <div v-if="hasData" class="tickets-component__pagination">
          <n-pagination
            v-model:page="pagination.page"
            :item-count="pagination.total"
            :page-size="pagination.per_page"
            :show-quick-jumper="true"
            :show-size-picker="true"
            :page-sizes="[10, 20, 50, 100]"
            @update:page="changePage"
            @update:page-size="updatePageSize"
          />
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from "vue"
  import { useTickets } from "./composables/useTickets"
  import BaseTable from "@/components/base/BaseTable.vue"
  import TicketFilters from "./TicketFilters.vue"
  import { InformationCircleOutline as InfoIcon } from "@vicons/ionicons5"

  // Composables
  const {
    data,
    loading,
    pagination,
    filters,
    hasData,
    columns,
    tabs,
    changeTicketType,
    changePage,
    updatePageSize,
    navigateToCreate,
    applyFilters,
  } = useTickets()

  // Computed
  const currentTabType = computed({
    get: () => filters.value.ticket_type || "customer_call",
    set: (value) => changeTicketType(value as any),
  })

  // Methods are now handled by the composable
</script>

<style lang="scss" scoped>
  .tickets-component {
    padding: rem(20);

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: rem(24);
      padding-bottom: rem(16);
      border-bottom: 1px solid var(--n-border-color);
    }

    &__title {
      margin: 0;
      font-size: rem(24);
      font-weight: 600;
      color: var(--n-text-color);
    }

    &__tabs {
      margin-bottom: rem(20);
    }

    &__table-container {
      max-height: 500px;
      margin-bottom: rem(20);
      overflow-x: auto;
      border: 1px solid var(--n-border-color);
      border-radius: var(--n-border-radius);

      // Стилизация скроллбара
      &::-webkit-scrollbar {
        height: 8px;
      }

      &::-webkit-scrollbar-track {
        background: var(--n-scrollbar-color);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--n-scrollbar-color-hover);
        border-radius: 4px;

        &:hover {
          background: var(--n-scrollbar-color-pressed);
        }
      }
    }

    &__empty {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__pagination {
      display: flex;
      justify-content: flex-end;
      padding: rem(16) 0;
    }
  }

  .tab-content {
    display: flex;
    align-items: center;
    gap: rem(4);
  }

  .tab-icon {
    opacity: 0.6;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }

  // Все элементы в одну строку без переносов
  :deep(.n-data-table .n-data-table-tr) {
    white-space: nowrap;
  }

  :deep(.n-data-table-td) {
    vertical-align: middle;
    white-space: nowrap;
    padding: rem(8) rem(12);
  }

  :deep(.n-data-table-th) {
    white-space: nowrap;
    padding: rem(12) rem(12);
    font-weight: 600;
  }

  // Стили для тегов в колонке ТЗ
  :deep(.tz-style .n-tag) {
    flex-shrink: 0;
    margin: rem(2);
    white-space: nowrap;
  }

  // Специальные стили для колонки действий
  :deep(.n-data-table-td[data-col-key="actions"]) {
    border-left: 1px solid var(--n-border-color);
  }
</style>
