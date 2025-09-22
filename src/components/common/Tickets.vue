<template>
  <div class="tickets-component">
    <base-table :pagination="pagination" :data="data" :columns="columns" />
  </div>
</template>

<script lang="ts" setup>
  import { DataTableColumns, NButton, NIcon, NTag } from "naive-ui"
  import {
    PencilSharp as PencilIcon,
    TrashOutline as TrashIcon,
  } from "@vicons/ionicons5"

  import { h, computed, reactive, onMounted } from "vue"
  import BaseTable from "@/components/base/BaseTable.vue"
  import { useDictionaryStore } from "@/store/useDictionary.ts"

  interface RowData {
    key: number
    name: string
    age: number
    address: string
    tags: string[]
  }
  const dictionaryStore = useDictionaryStore()

  function createColumns(): DataTableColumns<RowData> {
    return [
      {
        title: "АЗС",
        key: "name",
      },
      {
        title: "Дата создания",
        key: "age",
      },
      {
        title: "Адрес",
        key: "address",
      },
      {
        title: "Тип заявки",
        key: "tags",
        render(row) {
          return row.tags.map((tagKey) => {
            return h(
              NTag,
              {
                style: {
                  marginRight: "6px",
                },
                type: tagKey.toLowerCase().includes("срочно")
                  ? "error"
                  : "info",
                bordered: true,
              },
              {
                default: () => tagKey,
              }
            )
          })
        },
      },
      {
        title: "Действия",

        key: "actions",
        fixed: "right",
        className: "custom-buttons",
        render: (row: RowData) => renderButtons(row),
      },
    ]
  }

  function createData(): RowData[] {
    return [
      {
        key: 0,
        name: "John Brown",
        age: 32,
        address: "New York No. 1 Lake Park",
        tags: ["Очень срочно"],
      },
      {
        key: 1,
        name: "Jim Green",
        age: 42,
        address: "London No. 1 Lake Park",
        tags: ["Умеренно"],
      },
      {
        key: 2,
        name: "Joe Black",
        age: 32,
        address: "Sidney No. 1 Lake Park",
        tags: ["Срочно"],
      },
      {
        key: 3,
        name: "Joe Black",
        age: 32,
        address: "Sidney No. 1 Lake Park",
        tags: ["Срочно"],
      },
      {
        key: 4,
        name: "Joe Black",
        age: 12,
        address: "Sidney No. 1 Lake Park",
        tags: ["Умеренно"],
      },
    ]
  }

  const data = computed(() => createData())
  const columns = computed(() => createColumns())
  const pagination = reactive({
    pageSize: 10,
  })

  onMounted(() => dictionaryStore.initDictionary())

  // {
  //   data: createData(),
  //     columns: createColumns(),
  //   pagination: {
  //   pageSize: 10,
  // },
  // }

  const renderButtons = (row: RowData) => {
    const buttons = [
      {
        icon: PencilIcon,
        type: "info",
        onClick: () => console.log(`Editing row with key: ${row.key}`),
      },
      {
        icon: TrashIcon,
        type: "error",
        onClick: () => console.log(`Deleting row with key: ${row.key}`),
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
</script>

<style scoped lang="scss">
  .tickets-component {
    padding: rem(20);
  }
</style>
