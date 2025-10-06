<template>
  <div class="skeleton-loading">
    <!-- Заголовок страницы -->
    <div class="skeleton-page-header">
      <n-skeleton text height="24px" width="24px" />
      <n-skeleton text height="28px" width="300px" />
    </div>

    <!-- Основная информация -->
    <section class="skeleton-section">
      <n-grid :y-gap="16" :x-gap="16" cols="1 500:2 800:3">
        <!-- Номер заявки -->
        <div class="skeleton-field">
          <n-skeleton
            text
            height="16px"
            width="120px"
            style="margin-bottom: 8px"
          />
          <n-skeleton text height="40px" />
        </div>

        <!-- Дата подачи заявки -->
        <div class="skeleton-field">
          <n-skeleton
            text
            height="16px"
            width="150px"
            style="margin-bottom: 8px"
          />
          <n-skeleton text height="40px" />
        </div>

        <!-- ФИО подавшего заявку -->
        <div class="skeleton-field">
          <n-skeleton
            text
            height="16px"
            width="180px"
            style="margin-bottom: 8px"
          />
          <n-skeleton text height="40px" />
        </div>

        <!-- АЗС -->
        <div class="skeleton-field">
          <n-skeleton
            text
            height="16px"
            width="50px"
            style="margin-bottom: 8px"
          />
          <n-skeleton text height="40px" />
        </div>

        <!-- Исполнитель -->
        <div class="skeleton-field">
          <n-skeleton
            text
            height="16px"
            width="100px"
            style="margin-bottom: 8px"
          />
          <n-skeleton text height="40px" />
        </div>

        <!-- Критичность -->
        <div class="skeleton-field">
          <n-skeleton
            text
            height="16px"
            width="90px"
            style="margin-bottom: 8px"
          />
          <n-skeleton text height="40px" />
        </div>

        <!-- Статус -->
        <div class="skeleton-field">
          <n-skeleton
            text
            height="16px"
            width="60px"
            style="margin-bottom: 8px"
          />
          <n-skeleton text height="40px" />
        </div>

        <!-- Тип заявки -->
        <div class="skeleton-field">
          <n-skeleton
            text
            height="16px"
            width="100px"
            style="margin-bottom: 8px"
          />
          <n-skeleton text height="40px" />
        </div>
      </n-grid>

      <!-- Описание заявки (полная ширина) -->
      <div class="skeleton-field skeleton-field-full">
        <n-skeleton
          text
          height="16px"
          width="140px"
          style="margin-bottom: 8px"
        />
        <n-skeleton text height="80px" />
      </div>
    </section>

    <n-divider />

    <!-- Техническое задание -->
    <section class="skeleton-section">
      <div class="skeleton-header">
        <n-skeleton text height="28px" width="200px" />
        <n-skeleton text height="32px" width="140px" />
      </div>
      <n-skeleton text height="200px" style="margin-top: 16px" />
    </section>

    <!-- Материалы (условно) -->
    <section class="skeleton-section" v-if="isHasWarehouseGuid">
      <n-divider />
      <n-skeleton
        text
        height="28px"
        width="300px"
        style="margin-bottom: 16px"
      />
      <n-skeleton text height="150px" />
    </section>

    <!-- Чек-листы (условно) -->
    <section class="skeleton-section" v-if="isPlannedTicket">
      <n-divider />
      <n-skeleton
        text
        height="28px"
        width="200px"
        style="margin-bottom: 16px"
      />
      <n-skeleton text height="120px" />
    </section>

    <!-- Сервисный лист (условно) -->
    <section class="skeleton-section" v-if="isUpdateForm">
      <n-divider />
      <n-skeleton
        text
        height="28px"
        width="250px"
        style="margin-bottom: 16px"
      />
      <n-grid :y-gap="16" :x-gap="16" cols="1 500:2 800:3">
        <div class="skeleton-field" v-for="i in 6" :key="i">
          <n-skeleton
            text
            height="16px"
            width="120px"
            style="margin-bottom: 8px"
          />
          <n-skeleton text height="40px" />
        </div>
      </n-grid>
    </section>

    <!-- Кнопки действий -->
    <div class="skeleton-actions">
      <n-skeleton text height="40px" width="120px" />
      <n-skeleton text height="40px" width="100px" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  interface Props {
    isHasWarehouseGuid?: boolean
    isPlannedTicket?: boolean
    isUpdateForm?: boolean
  }

  defineProps<Props>()
</script>

<style lang="scss" scoped>
  .skeleton-loading {
    margin-bottom: rem(40);
  }

  .skeleton-page-header {
    display: flex;
    align-items: center;
    gap: rem(12);
    margin-bottom: rem(24);
  }

  .skeleton-section {
    margin-bottom: rem(24);
  }

  .skeleton-field {
    margin-bottom: rem(16);
  }

  .skeleton-field-full {
    margin-top: rem(16);
  }

  .skeleton-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: rem(16);
  }

  .skeleton-actions {
    display: flex;
    justify-content: flex-end;
    gap: rem(10);
    margin: rem(20) 0;
  }
</style>
