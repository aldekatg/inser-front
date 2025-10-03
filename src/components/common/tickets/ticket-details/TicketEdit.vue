<template>
  <div class="tickets-component">
    <div class="tickets-component__header">
      <NIcon size="30">
        <ArrowBackCircleOutline
          @click="$router.back()"
          style="cursor: pointer"
        />
      </NIcon>
      <h1>Детали заявки № {{ formValue?.ticket_number }}</h1>
    </div>

    <ticket-details
      :form-data="formValue"
      :loading="loading"
      :ticket="ticketInfo"
      :rules="rules"
      @save="console.log('Saved data:', $event as TicketUpdatePayload)"
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
  import { TicketUpdatePayload } from "@/api/tickets/types.ts"

  const route = useRoute()

  const { rules, loading, formValue, ticketInfo, initTicketById } =
    useTicketDetailsHelper()

  onMounted(() => {
    initTicketById(route.params.id)
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
