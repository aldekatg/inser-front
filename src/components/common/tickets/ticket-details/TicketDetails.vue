<template>
  <div class="ticket-details">
    <div v-if="!loading" class="ticket-details__body">
      <n-form :model="formValue" :rules="rules" ref="formRef">
        <section id="main-info">
          <n-grid :y-gap="12" :x-gap="12" cols="1 500:2 800:3">
            <n-form-item-gi label="Номер заявки" path="ticket_number">
              <n-input
                v-model:value="formValue.ticket_number"
                disabled
                placeholder="Введите номер заявки"
              />
            </n-form-item-gi>
            <n-form-item-gi label="Дата подачи заявки" path="submitted_at">
              <n-date-picker
                v-model:value="formValue.submitted_at"
                type="datetime"
                :default-value="Date.now()"
                format="dd-MM-yyyy HH:mm:ss"
                style="width: 100%"
              />
            </n-form-item-gi>
            <n-form-item-gi label="ФИО подавшего заявку">
              <n-input :value="ticket?.gas_station.operator_name" disabled />
            </n-form-item-gi>
            <n-form-item-gi label="АЗС" path="gas_station_id">
              <n-select
                v-model:value="computedGasStationId"
                :default-value="ticket?.gas_station.object_number"
                :options="optionsOfGasStations"
                filterable
                @focus="getGasStations"
                :loading="loading"
                :value-field="'id'"
                :label-field="'object_number'"
              />
            </n-form-item-gi>
            <n-form-item-gi label="Исполнитель" path="employee_id">
              <n-select
                v-model:value="computedEmployeeId"
                :default-value="ticket?.employee.full_name"
                :options="optionsOfEmployee"
                filterable
                @focus="getEmployee"
                :loading="selectLoading"
                :value-field="'id'"
                :label-field="'full_name'"
              />
            </n-form-item-gi>
            <n-form-item-gi label="Критичность" path="criticality">
              <n-select
                v-model:value="formValue.criticality"
                :options="criticalityOptions"
                filterable
                :loading="loading"
              />
            </n-form-item-gi>
            <n-form-item-gi label="Статус" path="status">
              <n-select
                v-model:value="formValue.status"
                :options="statusOptions"
                filterable
                :loading="loading"
              />
            </n-form-item-gi>
            <n-form-item-gi label="Описание заявки" path="content">
              <n-input
                v-model:value="formValue.content"
                type="textarea"
                :loading="loading"
              />
            </n-form-item-gi>
          </n-grid>
        </section>

        <section>
          <n-h2>Техническое задание</n-h2>
          <BaseTreeSelect />
        </section>

        <section v-if="isUpdateForm" id="service-list">
          <n-divider />
          <n-h2 @click="collapseSL = !collapseSL">Сервисный лист</n-h2>
          <n-collapse-transition :show="collapseSL">
            <n-grid :y-gap="12" :x-gap="12" cols="1 500:2 800:3">
              <n-form-item-gi
                label="Номер сервисного листа"
                path="work_start_at"
              >
                <n-input type="textarea" :loading="loading" />
              </n-form-item-gi>
              <n-form-item-gi
                label="Дата и время окончания работ"
                path="work_end_at"
              >
                <n-date-picker
                  type="datetime"
                  format="dd-MM-yyyy HH:mm:ss"
                  style="width: 100%"
                />
              </n-form-item-gi>
              <n-form-item-gi
                label="Описание выполненных работ"
                path="work_description"
              >
                <n-input type="textarea" :loading="loading" />
              </n-form-item-gi>
              <n-form-item-gi label="Использованные запчасти" path="used_parts">
                <n-input type="textarea" :loading="loading" />
              </n-form-item-gi>
              <n-form-item-gi label="Стоимость работ" path="work_cost">
                <n-input
                  :loading="loading"
                  placeholder="Введите стоимость работ"
                />
              </n-form-item-gi>
            </n-grid>
          </n-collapse-transition>
          <n-divider />
        </section>
      </n-form>

      <div class="ticket-details__action">
        <n-button type="primary" @click="saveTicket" :loading="loading">
          Сохранить
        </n-button>
        <n-button secondary @click="$router.back()">Отмена</n-button>
      </div>
    </div>
    <div v-else class="skeleton-styles">
      <n-skeleton text :repeat="12" height="30px" size="medium" />
      <n-skeleton text round height="60px" size="medium" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    TicketCreatePayload,
    TicketDetails,
    TicketUpdatePayload,
  } from "@/api/tickets/types.ts"
  import BaseTreeSelect from "@/components/base/BaseTreeSelect.vue"
  import {
    StatusType,
    TicketCriticality,
    TicketStatusDictionary,
  } from "@/utils/types.ts"
  import { useAdditionalRequests } from "@/components/common/tickets/ticket-details/composables/useAdditionalRequests.ts"

  const { type, formData, loading, rules, ticket } = defineProps<
    | {
        type: "create"
        loading: boolean
        rules: any
        ticket?: null
        formData: TicketCreatePayload
      }
    | {
        type: "change"
        loading: boolean
        rules: any
        ticket?: TicketDetails
        formData: TicketUpdatePayload
      }
  >()

  const emit = defineEmits<{
    (e: "save", data: TicketCreatePayload): void
    (e: "save", data: TicketUpdatePayload): void
  }>()

  const {
    getGasStations,
    optionsOfGasStations,
    selectLoading,
    optionsOfEmployee,
    getEmployee,
  } = useAdditionalRequests()

  const formValue = ref<TicketCreatePayload | TicketUpdatePayload>(formData)

  const collapseSL = ref<boolean>(true)

  const computedEmployeeId = computed({
    get: () =>
      optionsOfEmployee.value.length ? formValue.value.employee_id : undefined,
    set: (value) => {
      if (optionsOfEmployee.value.length) {
        formValue.value.employee_id = value as number
      }
    },
  })

  const computedGasStationId = computed({
    get: () =>
      optionsOfGasStations.value.length
        ? formValue.value.gas_station_id
        : undefined,
    set: (value) => {
      if (optionsOfGasStations.value.length) {
        formValue.value.gas_station_id = value as number
      }
    },
  })

  const criticalityOptions = Object.entries(TicketCriticality).map(
    ([_, value]) => ({
      label: TicketStatusDictionary.TicketCriticality[value],
      value,
    })
  )

  const statusOptions = Object.entries(StatusType).map(([_, value]) => ({
    label: TicketStatusDictionary.StatusType[value],
    value,
  }))

  function saveTicket() {
    emit("save", formValue.value)
  }

  const isUpdateForm = computed(() => type === "change")

  watch(
    () => formData,
    (newVal) => {
      if (newVal) {
        formValue.value = { ...newVal }
      }
    },
    { immediate: true }
  )
</script>

<style lang="scss" scoped>
  .ticket-details {
    margin-bottom: rem(40);

    &__action {
      display: flex;
      justify-content: flex-end;
      gap: rem(10);
      margin: rem(20) 0;
    }
  }

  .skeleton-styles {
    display: flex;
    flex-direction: column;
    gap: rem(10);
    margin-bottom: 20px;
  }
</style>
