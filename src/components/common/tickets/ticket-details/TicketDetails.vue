<template>
  <div class="ticket-details">
    <div v-if="!loading" class="ticket-details__body">
      <n-form :model="formValue" :rules="rules" ref="formRef">
        <section id="main-info">
          <n-grid :y-gap="12" :x-gap="12" cols="1 500:2 800:3">
            <n-form-item-gi label="Номер заявки" path="ticket_number">
              <n-input
                v-model:value="formValue.ticket_number"
                clearable
                :loading="loading"
                placeholder="Введите номер заявки"
              />
            </n-form-item-gi>
            <n-form-item-gi label="Дата подачи заявки" path="submitted_at">
              <n-date-picker
                v-model:value="computedSubmittedAt"
                type="datetime"
                :default-value="new Date().getTime()"
                format="dd-MM-yyyy HH:mm:ss"
                style="width: 100%"
              />
            </n-form-item-gi>
            <n-form-item-gi v-if="isUpdateForm" label="ФИО подавшего заявку">
              <n-input
                placeholder="Введите ФИО"
                :value="ticket?.gas_station.operator_name"
                disabled
              />
            </n-form-item-gi>
            <n-form-item-gi label="АЗС" path="gas_station_id">
              <n-select
                v-model:value="computedGasStationId"
                :default-value="computedGasStationDefaultValue"
                :value-field="'value'"
                placeholder="Выберите АЗС"
                :label-field="'label'"
                :options="optionsOfGasStations"
                filterable
                @focus="getGasStations"
                :loading="customLoading.gasStationLoading"
              />
            </n-form-item-gi>
            <n-form-item-gi label="Исполнитель" path="employee_id">
              <n-select
                v-model:value="computedEmployeeId"
                :default-value="ticket?.employee?.full_name"
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
                placeholder="Выберите критичность"
                v-model:value="formValue.criticality"
                :options="criticalityOptions"
                filterable
                :loading="loading"
              />
            </n-form-item-gi>
            <n-form-item-gi v-if="isUpdateForm" label="Статус" path="status">
              <n-select
                placeholder="Выберите статус"
                v-model:value="formValue.status"
                :options="getStatusOptions"
                filterable
                :loading="loading"
              />
            </n-form-item-gi>
            <n-form-item-gi label="Тип заявки">
              <n-select
                v-model:value="formValue.ticket_type"
                :options="statusSource"
                placeholder="Выберите тип заявки"
                :default-value="getTicketSource"
                :disabled="isUpdateForm"
              />
            </n-form-item-gi>
            <n-form-item-gi label="Описание заявки" path="content">
              <n-input
                placeholder="Введите описание заявки"
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
              <template #checked>Просмотр</template>
              <template #unchecked>Редактировать</template>
            </n-switch>
          </div>
          <technical-tasks-tree
            @update:selected-keys="getSelectedTasks"
            :is-edit-mode="isEditModeTZ"
            :preselected="formValue.technical_tasks_details"
          />
        </section>

        <section
          id="materials"
          v-if="
            formValue.technical_tasks_details?.length &&
            isHasWarehouseGuid &&
            isUpdateForm
          "
        >
          <n-divider />
          <n-h2>Использованные материалы</n-h2>
          <materials
            :materials="hasMaterials"
            :guid="isHasWarehouseGuid || ''"
            :selected-tech-tasks="formValue.technical_tasks_details"
            @update:materials="updateMaterials"
            :loading="loading"
          />
        </section>

        <section
          id="checkboxes"
          v-if="formValue.technical_tasks_details?.length && isPlannedTicket"
        >
          <n-divider />
          <n-h2>Чек-листы</n-h2>
          <checklists
            :technical-details="formValue.technical_tasks_details"
            @change="onChecklistsChange"
            @update:technical-details="updateTechnicalDetails"
          />
        </section>

        <section id="service-list" v-if="isUpdateForm">
          <n-divider />
          <n-h2>Сервисный лист</n-h2>
          <n-grid :y-gap="12" :x-gap="12" cols="1 500:2 800:3">
            <n-form-item-gi label="Номер сервисного листа" path="work_start_at">
              <n-input-number
                style="width: 100%"
                clearable
                placeholder="Введите номер сервисного листа"
                v-model:value="formValue.service_sheet_number"
                :loading="loading"
              />
            </n-form-item-gi>

            <n-form-item-gi label="Дата начала работ" path="work_started_at">
              <n-date-picker
                v-model:value="computedWorkStartedAt"
                type="datetime"
                format="dd-MM-yyyy HH:mm:ss"
                style="width: 100%"
              />
            </n-form-item-gi>
            <n-form-item-gi
              label="Дата окончания работ"
              path="work_finished_at"
            >
              <n-date-picker
                v-model:value="computedWorkFinishedAt"
                type="datetime"
                format="dd-MM-yyyy HH:mm:ss"
                style="width: 100%"
              />
            </n-form-item-gi>
            <n-form-item-gi label="Комментарий по сотрудника" path="comment">
              <n-input
                type="textarea"
                v-model:value="formValue.comment"
                :loading="loading"
              />
            </n-form-item-gi>
            <n-form-item-gi
              label="Результат диагностики"
              path="diagnostic_result"
            >
              <n-input
                type="textarea"
                v-model:value="formValue.diagnostic_result"
                :loading="loading"
              />
            </n-form-item-gi>
            <n-form-item-gi label="Результат работ" path="work_result">
              <n-input
                type="textarea"
                v-model:value="formValue.work_result"
                :loading="loading"
              />
            </n-form-item-gi>
          </n-grid>
        </section>
      </n-form>

      <div class="ticket-details__action">
        <div class="buttons-row">
          <n-tooltip
            v-if="isUpdateForm"
            :disabled="
              isFormCompletelyValid &&
              hasValidMaterials &&
              !ticket?.is_materials_sent
            "
            trigger="hover"
            placement="top"
          >
            <template #trigger>
              <n-button
                type="info"
                :disabled="
                  ticket?.is_materials_sent ||
                  !isFormCompletelyValid ||
                  !hasValidMaterials
                "
                @click="syncWithWarehouse"
                :loading="loading"
              >
                Синхронизация со складом
              </n-button>
            </template>
            <div v-if="ticket?.is_materials_sent">
              Материалы уже отправлены на склад
            </div>
            <div v-else-if="!hasValidMaterials">
              Для синхронизации со складом необходимо выбрать материалы в
              разделе "Использованные материалы"
            </div>
            <div v-else-if="!isFormCompletelyValid">
              <div>Для синхронизации со складом необходимо заполнить:</div>
              <ul class="tooltip-list">
                <li v-for="field in getMissingFields" :key="field">
                  {{ field }}
                </li>
              </ul>
            </div>
          </n-tooltip>
          <n-tooltip
            v-if="!isFormValid && missingFields.length > 0"
            trigger="hover"
            placement="top"
          >
            <template #trigger>
              <n-button
                type="primary"
                @click="saveTicket"
                :loading="loading"
                :disabled="!isFormValid"
              >
                Сохранить
              </n-button>
            </template>
            <div>
              <div style="font-weight: 600; margin-bottom: 8px">
                Заполните обязательные поля:
              </div>
              <ul style="margin: 0; padding-left: 16px">
                <li v-for="field in missingFields" :key="field">
                  {{ field }}
                </li>
              </ul>
            </div>
          </n-tooltip>
          <n-button
            v-else
            type="primary"
            @click="saveTicket"
            :loading="loading"
            :disabled="!isFormValid"
          >
            Сохранить
          </n-button>
          <n-button secondary @click="$router.back()">Отмена</n-button>
        </div>
      </div>
    </div>
    <ticket-details-skeleton
      v-else
      :is-has-warehouse-guid="!!isHasWarehouseGuid"
      :is-planned-ticket="isPlannedTicket"
      :is-update-form="isUpdateForm"
    />
  </div>
</template>

<script lang="ts" setup>
  import TechnicalTasksTree from "@/components/common/tickets/ticket-details/sections/TechnicalTasksTree.vue"
  import TicketDetailsSkeleton from "@/components/common/tickets/ticket-details/sections/TicketDetailsSkeleton.vue"
  import {
    TechnicalTaskDetail,
    TicketCreatePayload,
    TicketDetails,
    TicketUpdatePayload,
  } from "@/api/tickets/types.ts"
  import { useAdditionalRequests } from "@/components/common/tickets/ticket-details/composables/useAdditionalRequests.ts"
  import { criticalityOptions, statusOptions, statusSource } from "@/utils"
  import { TicketStatusDictionary } from "@/utils/types.ts"
  import Materials from "@/components/common/tickets/ticket-details/sections/Materials.vue"
  import Checklists from "@/components/common/tickets/ticket-details/sections/Checklists.vue"
  import { EmployeeResponse } from "@/api/employees/types.ts"
  import { MaterialItem } from "@/components/common/tickets/types.ts"

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
    (e: "create", data: TicketCreatePayload): void
    (e: "update", data: TicketUpdatePayload): void
    (e: "syncWarehouse", data: TicketUpdatePayload): void
  }>()

  const {
    getGasStations,
    optionsOfGasStations,
    customLoading,
    optionsOfEmployee,
    getEmployee,
  } = useAdditionalRequests()

  const formValue = ref<TicketCreatePayload | TicketUpdatePayload>(formData)
  const formRef = ref()

  const computedGasStationDefaultValue = computed(() => {
    if (ticket?.gas_station) {
      return `${ticket?.gas_station.object_number}, ${
        ticket?.gas_station.company?.name
      }, ${ticket?.gas_station.region?.name}`
    }
    return ""
  })

  // Проверка обязательных полей
  const hasRequiredFields = computed(() => {
    const requiredFields = [
      "ticket_number",
      "gas_station_id",
      "employee_id",
      "criticality",
      "status",
      "content",
      "ticket_type",
    ]

    return requiredFields.every((field) => {
      const value = formValue.value[field as keyof typeof formValue.value]
      return value !== null && value !== undefined && value !== ""
    })
  })

  // Проверка валидности технических заданий
  const hasValidTechnicalTasks = computed(() => {
    return (
      formValue.value.technical_tasks_details &&
      formValue.value.technical_tasks_details.length > 0
    )
  })

  // Проверка полей сервисного листа для формы редактирования
  const hasValidServiceFields = computed(() => {
    if (!isUpdateForm.value) return true

    const serviceFields = [
      "service_sheet_number",
      "work_started_at",
      "work_finished_at",
    ]

    return serviceFields.every((field) => {
      const value = formValue.value[field as keyof typeof formValue.value]
      return value !== null && value !== undefined && value !== ""
    })
  })

  // Проверка наличия материалов для синхронизации со складом
  const hasValidMaterials = computed(() => {
    if (!isUpdateForm.value) return true

    return (
      formValue.value.materials &&
      Array.isArray(formValue.value.materials) &&
      formValue.value.materials.length > 0
    )
  })

  // Общая валидность формы
  const isFormCompletelyValid = computed(() => {
    return (
      hasRequiredFields.value &&
      hasValidTechnicalTasks.value &&
      hasValidServiceFields.value
    )
  })

  // Получение списка незаполненных полей для отображения пользователю
  const getMissingFields = computed(() => {
    const missingFields = []

    if (!hasRequiredFields.value) {
      const requiredFields = [
        { key: "ticket_number", label: "Номер заявки" },
        { key: "gas_station_id", label: "АЗС" },
        { key: "employee_id", label: "Исполнитель" },
        { key: "criticality", label: "Критичность" },
        { key: "status", label: "Статус" },
        { key: "content", label: "Описание заявки" },
        { key: "ticket_type", label: "Тип заявки" },
      ]

      requiredFields.forEach((field) => {
        const value = formValue.value[field.key as keyof typeof formValue.value]
        if (value === null || value === undefined || value === "") {
          missingFields.push(field.label)
        }
      })
    }

    if (!hasValidTechnicalTasks.value) {
      missingFields.push("Техническое задание")
    }

    if (!hasValidMaterials.value && isUpdateForm.value) {
      missingFields.push("Материалы")
    }

    if (!hasValidServiceFields.value && isUpdateForm.value) {
      const serviceFields = [
        { key: "service_sheet_number", label: "Номер сервисного листа" },
        { key: "work_started_at", label: "Дата начала работ" },
        { key: "work_finished_at", label: "Дата окончания работ" },
      ]

      serviceFields.forEach((field) => {
        const value = formValue.value[field.key as keyof typeof formValue.value]
        if (value === null || value === undefined || value === "") {
          missingFields.push(field.label)
        }
      })
    }

    return missingFields
  })

  const getStatusOptions = computed(() => {
    // if (isUpdateForm.value) {
    //   return statusOptions.filter((status) => status.value !== StatusType.NEW)
    // }
    return statusOptions
  })

  const isHasWarehouseGuid = computed(() => {
    return formValue.value.employee?.warehouse?.guid
  })

  const isPlannedTicket = computed(() => {
    return formValue.value.ticket_type === "planned"
  })

  const computedEmployeeId = computed({
    get: () =>
      optionsOfEmployee.value.length ? formValue.value.employee_id : undefined,
    set: (value) => {
      if (optionsOfEmployee.value.length) {
        formValue.value.employee_id = value as number
        formValue.value.employee = optionsOfEmployee.value.find(
          (emp) => emp.id === value
        ) as EmployeeResponse
      }
    },
  })

  const hasMaterials = computed(() => {
    if (formValue.value.materials && formValue.value.materials.length) {
      return formValue.value.materials.map((material: any) => ({
        nomenclature_guid: material.nomenclature_guid,
        nomenclature_name: material.nomenclature_name,
        assignment_code: material.assignment_code,
        quantity: material.quantity,
      }))
    }
    return []
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

  const isEditModeTZ = ref<boolean>(
    !!formValue.value.technical_tasks_details.length || !isUpdateForm.value
  )

  // Валидация для кнопки "Сохранить"
  const isFormValid = computed(() => {
    if (isUpdateForm.value) {
      // Для редактирования проверяем только основные поля
      return false
    } else {
      // Для создания проверяем все обязательные поля
      return !!(
        formValue.value.gas_station_id &&
        formValue.value.criticality &&
        formValue.value.ticket_type &&
        formValue.value.content &&
        formValue.value.employee_id
      )
    }
  })

  // Получение списка незаполненных полей для подсказки
  const missingFields = computed(() => {
    const missing: string[] = []

    if (!formValue.value.gas_station_id) missing.push("АЗС")
    if (!formValue.value.criticality) missing.push("Критичность")
    if (!formValue.value.ticket_type) missing.push("Тип заявки")
    if (!formValue.value.content) missing.push("Описание заявки")
    if (!formValue.value.employee_id) missing.push("Исполнитель")

    return missing
  })

  const getTicketSource = computed(() => {
    if (ticket?.ticket_type) {
      return (
        TicketStatusDictionary.TicketSource[
          ticket?.ticket_type as keyof typeof TicketStatusDictionary.TicketSource
        ] || "Неизвестно"
      )
    }
    return ""
  })

  function getSelectedTasks(selected: TechnicalTaskDetail[]) {
    formValue.value.technical_tasks_details = selected
  }

  function syncWithWarehouse() {
    if (isUpdateForm.value) {
      emit("syncWarehouse", formValue.value as TicketUpdatePayload)
    }
  }

  function saveTicket() {
    formValue.value.technical_tasks_preview =
      formValue.value.technical_tasks_details.map((item) => item.code)

    if (isUpdateForm.value) {
      emit("update", formValue.value as TicketUpdatePayload)
    } else {
      emit("create", formValue.value as TicketCreatePayload)
    }
  }

  function updateMaterials(materials: MaterialItem[]) {
    formValue.value.materials = materials.map((material: MaterialItem) => ({
      assignment_code: material.assignment_code,
      nomenclature_name: material.nomenclature_name,
      nomenclature_guid: material.nomenclature_guid,
      quantity: material.quantity,
    }))
  }

  // Получаем изменения чек-листов (id элемента -> done)
  function onChecklistsChange(value: Record<number, boolean>) {
    console.debug("checklists changed", value)
  }

  // Обновляем технические задания с состоянием чекбоксов
  function updateTechnicalDetails(updatedDetails: TechnicalTaskDetail[]) {
    formValue.value.technical_tasks_details = updatedDetails
  }

  // Date pickers expect number (timestamp). Convert ISO/string/Date ⇄ number
  const computedSubmittedAt = computed<number | null>({
    get: () => toTimestamp(formValue.value.submitted_at),
    set: (val) =>
      (formValue.value.submitted_at = fromTimestamp(
        val,
        formValue.value.submitted_at
      )),
  })

  const computedWorkStartedAt = computed<number | null>({
    get: () => toTimestamp(formValue.value.work_started_at as any),
    set: (val) =>
      (formValue.value.work_started_at = fromTimestamp(
        val,
        formValue.value.work_started_at as any
      )),
  })

  const computedWorkFinishedAt = computed<number | null>({
    get: () => toTimestamp(formValue.value.work_finished_at as any),
    set: (val) =>
      (formValue.value.work_finished_at = fromTimestamp(
        val,
        formValue.value.work_finished_at as any
      )),
  })

  function toTimestamp(
    value: string | number | Date | undefined | null
  ): number | null {
    if (value === undefined || value === null || value === "") return null
    if (typeof value === "number") return value
    if (value instanceof Date) return value.getTime()
    const parsed = Date.parse(value as string)
    return Number.isNaN(parsed) ? null : parsed
  }

  function fromTimestamp(
    value: number | null,
    fallback?: string | number | Date
  ): string | number | Date {
    if (value === null) return fallback ?? new Date().toISOString()
    return new Date(value).toISOString()
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
      flex-direction: column;
      gap: rem(10);
      margin: rem(20) 0;

      .validation-indicator {
        margin-bottom: rem(10);
      }

      .buttons-row {
        display: flex;
        justify-content: flex-end;
        gap: rem(10);
      }
    }
  }

  .technical-tasks {
    display: flex;
    align-items: self-start;
    justify-content: flex-start;
    gap: rem(10);
  }

  // Стили для списков в тултипах
  :deep(.tooltip-list) {
    margin: 8px 0;
    padding-left: 16px;

    li {
      margin-bottom: 2px;
    }
  }
</style>
