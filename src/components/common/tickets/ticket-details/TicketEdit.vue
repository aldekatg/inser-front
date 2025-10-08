<template>
  <div class="tickets-component">
    <div class="tickets-component__header">
      <NIcon size="30">
        <ArrowBackCircleOutline
          @click="$router.back()"
          style="cursor: pointer"
        />
      </NIcon>
      <h1 v-if="!loading">Детали заявки № {{ formValue?.ticket_number }}</h1>
      <div style="display: flex; gap: 10px" v-else>
        <n-skeleton width="300px" height="32px" />
        <n-skeleton width="300px" height="32px" round />
      </div>
    </div>

    <ticket-details
      :form-data="formValue"
      :loading="loading"
      :ticket="ticketInfo"
      @syncWarehouse="syncWarehouse"
      :checklists="checklists"
      :checklistItems="checklistItems"
      :rules="rules"
      @update="updateTicket"
      type="change"
    />
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from "vue"
  import { useRoute } from "vue-router"

  import { useTicketDetailsHelper } from "@/components/common/tickets/ticket-details/composables/useTicketDetailsHelper.ts"
  import TicketDetails from "@/components/common/tickets/ticket-details/TicketDetails.vue"
  import { ArrowBackCircleOutline } from "@vicons/ionicons5"

  const route = useRoute()

  const {
    rules,
    loading,
    formValue,
    ticketInfo,
    initTicketById,
    checklists,
    updateTicket,
    syncWarehouse,
    checklistItems,
    initCheckLists,
  } = useTicketDetailsHelper()

  onMounted(() => {
    initTicketById(route.params.id)
    initCheckLists()
  })
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
  }
</style>
