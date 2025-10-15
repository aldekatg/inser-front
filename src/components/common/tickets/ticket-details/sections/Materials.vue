<template>
  <n-tabs v-model:value="activeTab" type="line" animated ref="tabsRef">
    <n-tab-pane
      v-for="tab in tasks"
      :name="tab.code"
      :key="tab.code"
      :tab="tab.code"
    >
      <div class="materials-grid">
        <div
          v-for="(material, mIdx) in tab.materials"
          :key="`${tab.code}-${mIdx}`"
          class="material-row"
        >
          <div class="material-field">
            <label class="field-label">Материалы</label>
            <n-select
              :disabled="disabled"
              v-model:value="material.nomenclature_guid"
              :options="materialOptionsWithQuantity"
              :loading="materialsLoading"
              value-field="nomenclature_guid"
              label-field="label"
              @update:value="makeOnUpdate(tab, material)"
              placeholder="Выберите материал"
            />
          </div>
          <div class="material-field">
            <label class="field-label">Количество расходников</label>
            <n-input-number
              clearable
              :disabled="disabled"
              :max="getRowMax(material)"
              v-model:value="material.quantity"
              :loading="loading"
              @update:value="() => syncSelected()"
              placeholder="Введите количество"
            />
          </div>
          <div class="material-field" v-if="material.nomenclature_guid !== ''">
            <label class="field-label">&nbsp;</label>
            <n-button
              type="error"
              secondary
              :disabled="disabled"
              @click="removeMaterial(tab, mIdx)"
              :loading="loading"
            >
              Удалить
            </n-button>
          </div>
        </div>
      </div>

      <n-button
        style="margin-bottom: 12px"
        size="small"
        :disabled="disabled"
        @click="addMaterial(tab)"
      >
        Добавить материал
      </n-button>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
  import { nextTick, toRefs, defineEmits, defineProps } from "vue"
  import type { TabsInst } from "naive-ui"
  import { MaterialResponse, TechnicalTaskDetail } from "@/api/tickets/types"
  import { fetchMaterials } from "@/api/tickets"
  import { MaterialItem, TaskTab } from "@/components/common/tickets/types"

  const props = defineProps<{
    materials: MaterialItem[]
    selectedTechTasks: TechnicalTaskDetail[]
    guid: string
    disabled?: boolean
    loading?: boolean
  }>()
  const { materials, selectedTechTasks, guid, loading, disabled } =
    toRefs(props)

  const message = useMessage()
  const tabsRef = ref<TabsInst | null>(null)
  const tasks = ref<TaskTab[]>([])
  const activeTab = ref<string | null>(null)
  const materialsLoading = ref(false)
  const isPrefilling = ref(false)

  function createEmptyRow(taskCode: string): MaterialItem {
    return {
      nomenclature_guid: "",
      nomenclature_name: "",
      assignment_code: taskCode,
      quantity: 0,
    }
  }

  function prefillFromMaterials(): void {
    if (!tasks.value.length) return
    isPrefilling.value = true

    const byTask = new Map<string, MaterialItem[]>()
    for (const m of materials.value ?? []) {
      const arr = byTask.get(m.assignment_code) || []
      arr.push({ ...m })
      byTask.set(m.assignment_code, arr)
    }

    for (const t of tasks.value) {
      const rows = byTask.get(t.code)
      if (rows && rows.length) t.materials = rows.map((r) => ({ ...r }))
    }

    isPrefilling.value = false
  }

  watch(materials, () => prefillFromMaterials(), {
    immediate: true,
    deep: true,
  })

  watch(
    selectedTechTasks,
    async (list: TechnicalTaskDetail[]) => {
      const prev = new Map<string, TaskTab>(
        tasks.value.map((t: TaskTab) => [t.code, t])
      )
      tasks.value = list
        .map(
          (task: TechnicalTaskDetail) =>
            prev.get(task.code) ?? {
              code: task.code,
              materials: [createEmptyRow(task.code)],
            }
        )
        .sort((a, b) => a.code.localeCompare(b.code))

      // поддерживаем актуальный активный таб
      const codes = tasks.value.map((t: TaskTab) => t.code)

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

      // префилл, если материалы уже были загружены раньше
      prefillFromMaterials()
    },
    { immediate: true, deep: true }
  )

  const selectedMaterials = ref<MaterialItem[]>([])

  const emit = defineEmits<{
    (e: "update:materials", payload: MaterialItem[]): void
  }>()

  const materialOptions = ref<MaterialResponse[]>([])

  // Опции материалов с отображением количества
  const materialOptionsWithQuantity = computed(() => {
    return materialOptions.value.map((option) => ({
      ...option,
      label: `${option.nomenclature_name} (${option.quantity || 0} шт.)`,
      originalLabel: option.nomenclature_name,
    }))
  })

  // Map доступных остатков из materialOptions (guid -> остаток)
  function buildAvailableMap() {
    const map = new Map<string, number>()
    for (const opt of materialOptions.value) {
      map.set(opt.nomenclature_guid, Number(opt.quantity) || 0)
    }
    return map
  }

  // Сумма уже выбранного количества по всем ТЗ для конкретного материала (по guid)
  function sumUsedByGuid(guid: string): number {
    let total = 0
    for (const t of tasks.value) {
      for (const m of t.materials) {
        if (m.nomenclature_guid === guid) {
          total += Number(m.quantity) || 0
        }
      }
    }
    return total
  }

  // Максимум для конкретной строки с учётом выбранного в других ТЗ
  function getRowMax(row: {
    nomenclature_guid: string
    quantity: number
  }): number {
    const availableMap = buildAvailableMap()
    const guid = row.nomenclature_guid
    if (!guid) return 0
    const totalAvail = availableMap.get(guid) || 0
    const totalUsed = sumUsedByGuid(guid)
    const current = Number(row.quantity) || 0
    // доступно для этой строки = остаток - (использовано всеми - текущее значение этой строки)
    const max = totalAvail - (totalUsed - current)
    return Math.max(0, max)
  }

  function addMaterial(tab: TaskTab): void {
    const next = [...tab.materials, createEmptyRow(tab.code)]
    tab.materials = next
  }

  function removeMaterial(tab: TaskTab, index: number): void {
    if (tab.materials.length > 1) {
      // Если материалов больше одного - удаляем строку
      tab.materials.splice(index, 1)
    } else {
      // Если это последний материал - очищаем инпуты
      const material = tab.materials[index]
      material.nomenclature_guid = ""
      material.nomenclature_name = ""
      material.quantity = 0
    }
    syncSelected()
  }

  function applySelection(
    value: string,
    option: any,
    tab: TaskTab,
    materialRow: MaterialItem
  ): void {
    materialRow.nomenclature_guid = value
    materialRow.assignment_code = tab?.code ?? ""
    materialRow.nomenclature_name =
      option?.originalLabel ?? option?.nomenclature_name ?? ""

    // Пересчитываем лимиты по всем строкам
    syncSelected()
  }

  function onSelect(
    value: string,
    option: any,
    tab: TaskTab,
    materialRow: MaterialItem
  ) {
    applySelection(value, option, tab, materialRow)
  }

  function makeOnUpdate(tab: TaskTab, materialRow: MaterialItem) {
    return (val: string, option: any) => onSelect(val, option, tab, materialRow)
  }

  function syncSelected() {
    if (isPrefilling.value) return
    const acc: MaterialItem[] = []
    for (const t of tasks.value) {
      for (const m of t.materials) {
        if (m.nomenclature_guid) {
          acc.push({
            nomenclature_guid: m.nomenclature_guid,
            nomenclature_name: m.nomenclature_name,
            assignment_code: t.code,
            quantity: Number(m.quantity) || 0,
          })
        }
      }
    }
    selectedMaterials.value = acc

    emit("update:materials", selectedMaterials.value)
  }

  async function getMaterialFrom1C(forceReload = false) {
    materialsLoading.value = true
    try {
      // Если уже загружены и не форсируем перезагрузку - выходим
      if (materialOptions.value.length && !forceReload) {
        return
      }
      const response = await fetchMaterials(guid.value)

      if (!response || response.status !== "success" || !response.payload) {
        message.error("Не удалось загрузить материалы из 1С")
        return
      }
      materialOptions.value = response.payload
    } catch (e) {
      message.error("Не удалось загрузить материалы из 1С")
      console.error("Error fetching materials:", e)
    } finally {
      materialsLoading.value = false
    }
  }

  // Следим за изменением guid (смена исполнителя/склада)
  watch(
    guid,
    (newGuid, oldGuid) => {
      if (newGuid && newGuid !== oldGuid) {
        console.log("[Materials] Изменился склад, перезагружаем материалы", {
          oldGuid,
          newGuid,
        })

        // Очищаем старые материалы из опций
        materialOptions.value = []

        // Очищаем выбранные материалы во всех вкладках
        for (const tab of tasks.value) {
          tab.materials = [createEmptyRow(tab.code)]
        }

        // Очищаем выбранные материалы
        selectedMaterials.value = []
        emit("update:materials", [])

        // Загружаем новые материалы
        getMaterialFrom1C(true)
      }
    },
    { immediate: false }
  )

  onMounted(() => {
    if (guid.value) getMaterialFrom1C()
  })
</script>

<style lang="scss" scoped>
  .materials-grid {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    margin-bottom: rem(16);
    max-width: rem(800); // Ограничиваем максимальную ширину
    width: 100%;
  }

  .material-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: rem(16);
    align-items: end;
    border: 1px solid var(--n-border-color);
    border-radius: var(--n-border-radius);
    background-color: var(--n-card-color);
  }

  .material-field {
    display: flex;
    flex-direction: column;
  }

  .field-label {
    font-size: rem(14);
    font-weight: 500;
    color: var(--n-text-color);
    margin-bottom: rem(8);
    line-height: 1.2;
  }

  // Адаптивность
  @media (max-width: rem(768)) {
    .materials-grid {
      max-width: rem(600);
    }

    .material-row {
      grid-template-columns: 1fr;
      gap: rem(12);
    }
  }

  @media (max-width: rem(500)) {
    .materials-grid {
      max-width: rem(400);
    }

    .material-row {
      grid-template-columns: 1fr;
      gap: rem(8);
      padding: rem(12);
    }
  }
</style>
