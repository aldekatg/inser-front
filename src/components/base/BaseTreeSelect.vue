<template>
  <n-space vertical>
    <n-space>
      <n-radio-group v-model:value="checkStrategy">
        <n-radio-button value="all">All</n-radio-button>
        <n-radio-button value="parent">Parent</n-radio-button>
        <n-radio-button value="child">Child</n-radio-button>
      </n-radio-group>
    </n-space>
    <n-tree-select
      multiple
      cascade
      checkable
      label-field="code"
      key-field="id"
      children-field="work_types"
      :check-strategy="checkStrategy"
      :options="options"
      :default-value="['Dig It', 'go']"
      @update:value="handleUpdateValue"
    />
  </n-space>
</template>

<script setup lang="ts">
  import type { TreeSelectOption } from "naive-ui"
  import { ref } from "vue"

  const checkStrategy = ref<"all" | "child" | "parent">("all")
  const options = [
    {
      code: "ТЗ-12",
      description: "Помыть здание АЗС2",
      id: 2,
      work_types: [
        {
          code: "ТЗ-12-1234",
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n" +
            "\n",
          id: 5,
          technical_task_id: 2,
        },
        {
          code: "ТЗ-12-12345",
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n" +
            "\n",
          id: 4,
          technical_task_id: 2,
        },
      ],
    },
    {
      code: "ТЗ-123",
      description: "Помыть здание АЗС32",
      id: 3,
      work_types: [],
    },
  ]

  function handleUpdateValue(
    value: string | number | Array<string | number> | null,
    option: TreeSelectOption | null | Array<TreeSelectOption | null>
  ) {
    console.log(value, option)
  }
</script>
