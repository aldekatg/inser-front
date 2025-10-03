<template>
  <div class="ticket-details">
    <div v-if="!loading" class="ticket-details__body">
      <n-form :model="formValue" :rules="rules" ref="formRef">
        <section id="main-info">
          <n-grid :y-gap="12" :x-gap="12" cols="1 500:2 800:3">
            <n-form-item-gi label="Номер заявки" path="ticket_number">
              <n-input
                v-model:value="formValue.ticket_number"
                :loading="loading"
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
                :loading="customLoading.gasStationLoading"
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
                :loading="customLoading.employeeLoading"
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
        <n-divider />

        <section id="technical-tasks">
          <div class="technical-tasks">
            <n-h2>Техническое задание</n-h2>
            <n-switch v-model:value="isEditModeTZ">
              <template #checked>Редактировать</template>
              <template #unchecked>Просмотр</template>
            </n-switch>
          </div>
          <technical-tasks-tree
            @update:selected-keys="getSelectedTasks"
            :is-edit-mode="isEditModeTZ"
            :preselected="formValue.technical_tasks_details"
          />
        </section>
        <n-divider />

        <section v-if="isUpdateForm" id="service-list">
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
  import TechnicalTasksTree from "@/components/common/tickets/ticket-details/sections/TechnicalTasksTree.vue"
  import {
    TechnicalTaskDetail,
    TicketCreatePayload,
    TicketDetails,
    TicketUpdatePayload,
  } from "@/api/tickets/types.ts"
  import { useAdditionalRequests } from "@/components/common/tickets/ticket-details/composables/useAdditionalRequests.ts"
  import { criticalityOptions, statusOptions } from "@/utils"

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
    customLoading,
    optionsOfEmployee,
    getEmployee,
  } = useAdditionalRequests()

  const formValue = ref<TicketCreatePayload | TicketUpdatePayload>(formData)
  const collapseSL = ref<boolean>(true)
  const isEditModeTZ = ref<boolean>(
    !formValue.value.technical_tasks_details.length
  )

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

  const isUpdateForm = computed(() => type === "change")

  function getSelectedTasks(selected: TechnicalTaskDetail[]) {
    formValue.value.technical_tasks_details = selected
  }

  function saveTicket() {
    emit("save", formValue.value)
  }

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

  .technical-tasks {
    display: flex;
    align-items: start;
    justify-content: space-between;
    margin-bottom: rem(10);
  }

  .skeleton-styles {
    display: flex;
    flex-direction: column;
    gap: rem(10);
    margin-bottom: 20px;
  }
</style>
