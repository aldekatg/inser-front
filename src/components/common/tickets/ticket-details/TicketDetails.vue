<template>
  <div class="ticket-details">
    <h1>Детали заявки</h1>
    {{ route.params }}
  </div>
</template>

<script lang="ts" setup>
  import { useRoute } from "vue-router"

  const route = useRoute()
</script>

<style scoped lang="scss">
  .ticket-details {
    padding: rem(20);
  }
</style>
