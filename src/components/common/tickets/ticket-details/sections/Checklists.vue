<template>
  <div class="checklists">
    <n-tabs v-model:value="activeTab" type="line" animated ref="tabsRef">
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
  import { nextTick } from "vue"
  import type { TabsInst } from "naive-ui"
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
    (e: "update:technicalDetails", value: TechnicalTaskDetail[]): void
  }>()

  type Tab = { code: string; checklists: ChecklistType[] }

  const tabsRef = ref<TabsInst | null>(null)
  const tabs = ref<Tab[]>([])
  const activeTab = ref<string | null>(null)

  const doneState = reactive<Record<number, boolean>>({})

  // Строим табы из technicalDetails
  watch(
    () => props.technicalDetails,
    async (details) => {
      const prev = new Map<string, Tab>(tabs.value.map((t) => [t.code, t]))
      tabs.value = details
        .map((td) => {
          const lists = (td.checklists ?? []).filter(
            (cl: ChecklistType) => (cl.items?.length ?? 0) > 0
          )
          const existing = prev.get(td.code)
          // ВАЖНО: всегда обновляем checklists у существующего таба,
          // чтобы не тащить устаревшее содержимое между ТЗ
          return existing
            ? { ...existing, checklists: lists }
            : { code: td.code, checklists: lists }
        })
        .filter((t) => t.checklists.length > 0)
        .sort((a, b) => a.code.localeCompare(b.code))

      // поддерживаем актуальный активный таб
      const codes = tabs.value.map((t) => t.code)

      if (!codes.length) {
        activeTab.value = null
        return
      }
      if (!activeTab.value || !codes.includes(activeTab.value)) {
        await nextTick()
        activeTab.value = codes[0]
      } else {
        // триггерим перерасчёт линии при удалении/добавлении
        await nextTick(() => tabsRef.value?.syncBarPosition())
      }

      // Инициализируем/очищаем doneState по текущим пунктам
      const lists: ChecklistType[] = []
      for (const t of tabs.value) lists.push(...t.checklists)

      const currentIds = new Set<number>()
      for (const list of lists) {
        for (const item of list.items as ChecklistItemsType[]) {
          currentIds.add(item.id)
          if (doneState[item.id] === undefined) {
            doneState[item.id] = item.done ?? false
          }
        }
      }
      // Удаляем состояния для элементов, которых больше нет
      for (const key of Object.keys(doneState)) {
        const id = Number(key)
        if (!currentIds.has(id)) delete doneState[id]
      }
      emit("change", { ...doneState })
    },
    { immediate: true, deep: true }
  )

  function onToggle(id: number, val: boolean) {
    doneState[id] = val

    // Обновляем технические задания с новым состоянием done
    const updatedDetails = props.technicalDetails.map((td) => ({
      ...td,
      checklists: td.checklists?.map((cl) => ({
        ...cl,
        items: cl.items?.map((item) => ({
          ...item,
          done: doneState[item.id] ?? false,
        })),
      })),
    }))

    emit("change", { ...doneState })
    emit("update:technicalDetails", updatedDetails)
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
