<template>
  <div class="checklists">
    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane
        v-for="tab in tabs"
        :name="tab.code"
        :key="tab.code"
        :tab="tab.code"
      >
        <div
          v-for="checklist in tab.checklists"
          :key="checklist.id"
          class="checklists__group"
        >
          <n-h3>{{ checklist.description }}</n-h3>
          <div class="checklists__items">
            <div
              v-for="item in checklist.items"
              :key="item.id"
              class="checklists__item"
            >
              <n-checkbox
                :checked="Boolean(doneState[item.id])"
                @update:checked="(val: boolean) => onToggle(item.id, val)"
              >
                {{ item.description }}
              </n-checkbox>
            </div>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script lang="ts" setup>
  import type { TechnicalTaskDetail } from "@/api/tickets/types.ts"
  import type {
    ChecklistType,
    ChecklistItemsType,
  } from "@/api/gas-stations/types.ts"

  const props = defineProps<{
    technicalDetails: TechnicalTaskDetail[]
  }>()

  const emit = defineEmits<{
    (e: "change", value: Record<number, boolean>): void
  }>()

  type Tab = { code: string; checklists: ChecklistType[] }

  const tabs = ref<Tab[]>([])
  const activeTab = ref<string | null>(null)

  const doneState = reactive<Record<number, boolean>>({})

  // Строим табы из technicalDetails
  watch(
    () => props.technicalDetails,
    (details) => {
      const prev = new Map<string, Tab>(tabs.value.map((t) => [t.code, t]))
      tabs.value = details
        .map((td) => {
          const lists = (td.checklists ?? []).filter(
            (cl: ChecklistType) => (cl.items?.length ?? 0) > 0
          )
          const existing = prev.get(td.code)
          return existing ?? { code: td.code, checklists: lists }
        })
        .filter((t) => t.checklists.length > 0)
        .sort((a, b) => a.code.localeCompare(b.code))

      const codes = tabs.value.map((t) => t.code)
      if (!codes.length) {
        activeTab.value = null
      } else if (!activeTab.value || !codes.includes(activeTab.value)) {
        activeTab.value = codes[0]
      }

      // Инициализируем doneState по всем пунктам
      const lists: ChecklistType[] = []
      for (const t of tabs.value) lists.push(...t.checklists)
      for (const list of lists) {
        for (const item of list.items as ChecklistItemsType[]) {
          if (doneState[item.id] === undefined) doneState[item.id] = false
        }
      }
      emit("change", { ...doneState })
    },
    { immediate: true, deep: true }
  )

  function onToggle(id: number, val: boolean) {
    doneState[id] = val
    emit("change", { ...doneState })
  }
</script>

<style lang="scss" scoped>
  .checklists {
    display: flex;
    flex-direction: column;
    gap: rem(16);

    &__group {
      display: flex;
      flex-direction: column;
      gap: rem(8);
    }

    &__items {
      display: flex;
      flex-direction: column;
      gap: rem(6);
    }

    &__item {
      display: flex;
      align-items: center;
    }
  }
</style>
