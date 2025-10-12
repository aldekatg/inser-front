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
  import { useTicketDetailsHelper } from "@/components/common/tickets/ticket-details/composables/useTicketDetailsHelper.ts"
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

  const { checklists: allChecklists, initCheckLists } = useTicketDetailsHelper()

  // Функция для получения всех доступных чек-листов для ТЗ
  function getAllChecklistsForTechnicalTask(
    tdId: number,
    existingChecklists: ChecklistType[] = []
  ): ChecklistType[] {
    // Получаем все доступные чек-листы для данного ТЗ из useTicketDetailsHelper
    const availableChecklists = (allChecklists.value ?? []).filter(
      (cl) => cl.technical_task_id === tdId
    )

    // Создаём карту существующих чек-листов по id (чтобы сохранить состояние done)
    const existingMap = new Map<number, ChecklistType>()
    existingChecklists.forEach((cl) => {
      existingMap.set(cl.id, cl)
    })

    // Объединяем: берём все доступные чек-листы и дополняем их состоянием из существующих
    const merged = availableChecklists.map((availableCl) => {
      const existing = existingMap.get(availableCl.id)
      if (existing) {
        // Чек-лист уже был в заявке - берём его с состоянием done
        return existing
      } else {
        // Чек-лист доступен, но ещё не был заполнен - добавляем с пустым состоянием
        return {
          ...availableCl,
          items: (availableCl.items ?? []).map((item) => ({
            ...item,
            done: false,
          })),
        }
      }
    })

    return merged.filter((cl) => (cl.items?.length ?? 0) > 0)
  }

  // Строим табы из technicalDetails и всех доступных чек-листов
  watch(
    () => [props.technicalDetails, allChecklists.value],
    async () => {
      const details = props.technicalDetails
      const prev = new Map<string, Tab>(tabs.value.map((t) => [t.code, t]))

      tabs.value = details
        .map((td) => {
          // Получаем ВСЕ доступные чек-листы для этого ТЗ, не только те что в пропсах
          const lists = getAllChecklistsForTechnicalTask(td.id!, td.checklists)
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
    // Важно: берём ВСЕ чек-листы для каждого ТЗ, не только те что были в пропсах
    const updatedDetails = props.technicalDetails.map((td) => {
      const allChecklistsForTd = getAllChecklistsForTechnicalTask(
        td.id!,
        td.checklists
      )

      const updatedChecklists = allChecklistsForTd.map((cl) => ({
        ...cl,
        items: cl.items?.map((item) => ({
          ...item,
          done: doneState[item.id] ?? false,
        })),
      }))

      return {
        ...td,
        checklists: updatedChecklists,
      }
    })

    emit("change", { ...doneState })
    emit("update:technicalDetails", updatedDetails)
  }
  onMounted(() => {
    initCheckLists()
  })
</script>

<style lang="scss" scoped>
  .checklists {
    display: flex;
    flex-direction: column;
    gap: rem(16);

    &__group {
      margin-bottom: rem(15);
      display: flex;
      flex-direction: column;
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
