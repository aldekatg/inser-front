<template>
  <div class="analytics-container">
    <h1>Аналитика</h1>
    <n-alert
      v-if="!isDateRangeValid"
      type="info"
      title="Информация"
      class="info-alert"
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
            :placeholder="['Дата начала', 'Дата окончания']"
            class="date-picker"
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
              ghost
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
              @click="exportSlaReport"
              ghost
            >
              <template #icon>
                <n-icon>
                  <DocumentAttachOutline />
                </n-icon>
              </template>
              Выгрузить отчет по SLA
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
    exportSlaReport,
    isDateRangeValid,
  } = useAnalytics()
</script>

<style scoped lang="scss">
  .analytics-container {
    padding: 20px;
    margin: 0 auto;
    max-width: 1200px;

    @media (max-width: 768px) {
      padding: 15px;
    }

    @media (max-width: 480px) {
      padding: 10px;
    }

    h1 {
      font-size: 28px;
      margin-bottom: 20px;

      @media (max-width: 768px) {
        font-size: 24px;
        margin-bottom: 15px;
      }

      @media (max-width: 480px) {
        font-size: 20px;
        margin-bottom: 10px;
      }
    }
  }

  .info-alert {
    margin-top: 20px;
    width: 100%;
    max-width: 600px;

    @media (max-width: 768px) {
      margin-top: 15px;
      max-width: 100%;
    }
  }

  .analytics-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .analytics-content {
    padding: 20px 0;

    @media (max-width: 768px) {
      padding: 15px 0;
    }
  }

  .date-picker-section {
    margin-bottom: 20px;
    width: 100%;

    @media (max-width: 768px) {
      margin-bottom: 15px;
    }
  }

  .date-label {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 10px;
    display: block;

    @media (max-width: 480px) {
      font-size: 14px;
    }
  }

  .date-picker {
    width: 100%;
    max-width: 600px;

    @media (max-width: 768px) {
      max-width: 100%;
    }

    :deep(.n-input) {
      width: 100%;
    }
  }

  .export-buttons-section {
    margin-top: 20px;

    @media (max-width: 768px) {
      margin-top: 15px;
    }
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 10px;

    :deep(.n-button) {
      width: 100%;
      max-width: 600px;
      height: 50px;
      font-size: 16px;
      justify-content: center;

      @media (max-width: 768px) {
        max-width: 100%;
        height: 48px;
        font-size: 15px;
      }

      @media (max-width: 480px) {
        height: 44px;
        font-size: 14px;
        padding: 0 12px;
      }
    }
  }
</style>
