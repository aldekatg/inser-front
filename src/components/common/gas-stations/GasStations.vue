<template>
  <div class="gas-stations-component">
    <div class="gas-stations-component__actions">
      <NButton type="primary" @click="isModalOpen = true">Добавить АЗС</NButton>
    </div>
    <BaseTable :data="gasStations" :columns="columns" />
  </div>
  <GasStationModal
    :model-value="isModalOpen"
    :form="gasStationForm"
    @save="closeModal"
    @cancel="closeModal"
  />
</template>

<script setup lang="ts">
  import { h, onMounted, ref } from "vue"
  import { useGasStations } from "@/components/common/gas-stations/useGasStations.ts"
  import BaseTable from "@/components/base/BaseTable.vue"
  import { NButton, NIcon } from "naive-ui"
  import { GasStationType } from "@/api/gas-stations/types.ts"
  import {
    PencilSharp as PencilIcon,
    TrashOutline as TrashIcon,
  } from "@vicons/ionicons5"
  import GasStationModal from "@/components/common/gas-stations/GasStationModal.vue"

  const { initGasStations, gasStations, setGasStationForm, gasStationForm } =
    useGasStations()
  const isModalOpen = ref(false)

  const columns = ref([
    {
      title: "Адрес",
      key: "address",
    },
    {
      title: "Регион",
      key: "region",
    },
    {
      title: "Адрес",
      key: "address",
    },
    {
      title: "Компания",
      key: "company.name",
    },
    {
      title: "Почта",
      key: "email",
    },
    {
      title: "Оператор",
      key: "operator_name",
    },
    {
      title: "Действия",
      key: "actions",
      fixed: "right",
      className: "custom-buttons",
      render: (row: GasStationType) => renderButtons(row),
    },
  ])

  const renderButtons = (row: GasStationType) => {
    const buttons = [
      {
        icon: PencilIcon,
        type: "info",
        onClick: () => {
          console.log(Object.assign({}, row))
          setGasStationForm(Object.assign({}, row))
          isModalOpen.value = true
        },
      },
      {
        icon: TrashIcon,
        type: "error",
        onClick: () =>
          console.log(`Deleting row with key: ${row.operator_name}`),
      },
    ]

    return buttons.map((button: any) => {
      return h(
        NButton,
        {
          strong: true,
          secondary: true,
          circle: true,
          type: button.type,
          onClick: () => button.onClick(),
        },
        {
          icon: () => h(NIcon, null, { default: () => h(button.icon) }),
        }
      )
    })
  }

  const closeModal = () => {
    isModalOpen.value = false
  }

  onMounted(() => initGasStations())
</script>

<style scoped lang="scss">
  .gas-stations-component {
    padding: rem(40);

    &__actions {
      margin-bottom: rem(20);
    }
  }
</style>
