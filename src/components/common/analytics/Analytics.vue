<template>
  <div class="analytics-container">
    <h1>Аналитика</h1>
    <n-alert
      v-if="!isDateRangeValid"
      type="info"
      title="Информация"
      style="margin-top: 20px; width: 400px"
    >
      Пожалуйста, выберите период дат для выгрузки отчетов
    </n-alert>
    <div class="analytics-content">
      <div class="date-picker-section">
        <n-space vertical>
          <label class="date-label">Выберите период:</label>
          <n-date-picker
            v-model:value="dateRange"
            type="daterange"
            clearable
            :placeholder="['Дата с', 'Дата по']"
            style="width: 400px"
            format="dd.MM.yyyy"
          />
        </n-space>
      </div>

      <n-divider />

      <div class="export-buttons-section">
        <n-space vertical :size="20">
          <div class="button-group">
            <n-button
              type="primary"
              size="large"
              :disabled="!isDateRangeValid || loading"
              :loading="loading"
              @click="exportTicketsReport"
            >
              <template #icon>
                <n-icon>
                  <DocumentAttachOutline />
                </n-icon>
              </template>
              Выгрузить отчет по заявкам
            </n-button>
          </div>

          <div class="button-group">
            <n-button
              type="primary"
              size="large"
              :disabled="!isDateRangeValid || loading"
              :loading="loading"
              @click="exportWorkHoursReport"
              ghost
            >
              <template #icon>
                <n-icon>
                  <DocumentAttachOutline />
                </n-icon>
              </template>
              Выгрузить отчет по рабочим часам
            </n-button>
          </div>
        </n-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { DocumentAttachOutline } from "@vicons/ionicons5"
  import { useAnalytics } from "./useAnalytics"

  const {
    loading,
    dateRange,
    exportTicketsReport,
    exportWorkHoursReport,
    isDateRangeValid,
  } = useAnalytics()
</script>

<style scoped lang="scss">
  .analytics-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .analytics-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .analytics-content {
    padding: 20px 0;
  }

  .date-picker-section {
    margin-bottom: 20px;
  }

  .date-label {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 10px;
    display: block;
  }

  .export-buttons-section {
    margin-top: 20px;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 10px;

    :deep(.n-button) {
      width: 100%;
      max-width: 400px;
      height: 50px;
      font-size: 16px;
    }
  }
</style>
