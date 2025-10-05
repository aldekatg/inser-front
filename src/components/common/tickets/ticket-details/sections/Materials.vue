<template>
  <n-tabs
    v-model:value="activeTab"
    type="line"
    animated
    ref="tabsRef"
    style="min-height: 100px"
  >
    <n-tab-pane
      v-for="tab in tasks"
      :name="tab.code"
      :key="tab.code"
      :tab="tab.code"
    >
      <n-grid
        :y-gap="12"
        :x-gap="12"
        cols="1 500:2 800:3"
        v-for="(material, mIdx) in tab.materials"
        :key="mIdx"
      >
        <n-form-item-gi label="Материалы" path="materials">
          <n-select
            v-model:value="material.nomenclature_guid"
            :options="materialOptions"
            :loading="materialsLoading"
            value-field="nomenclature_guid"
            label-field="nomenclature_name"
            @focus="getMaterialFrom1C"
            @update:value="
              (val: string, option: MaterialResponse) =>
                pickMaterials(
                  val as string,
                  option as MaterialResponse,
                  tab,
                  material
                )
            "
          />
        </n-form-item-gi>
        <n-form-item-gi
          label="Количество расходников"
          path="materials_quantity"
        >
          <n-input-number
            style="width: 100%"
            clearable
            :max="getRowMax(material)"
            v-model:value="material.quantity"
            :loading="loading"
            @update:value="() => syncSelected()"
          />
        </n-form-item-gi>
      </n-grid>
      <n-button
        style="margin-bottom: 12px"
        size="small"
        @click="addMaterial(tab)"
      >
        Добавить материал
      </n-button>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
  import { nextTick } from "vue"
  import type { TabsInst } from "naive-ui"
  import { MaterialResponse, TechnicalTaskDetail } from "@/api/tickets/types.ts"
  import { fetchMaterials } from "@/api/tickets"
  import { MaterialItem, TaskTab } from "@/components/common/tickets/types.ts"

  const { selectedTechTasks, guid, loading, materials } = defineProps<{
    materials: MaterialItem[]
    selectedTechTasks: TechnicalTaskDetail[]
    guid: string
    loading?: boolean
  }>()

  const message = useMessage()

  const tabsRef = ref<TabsInst | null>(null)
  const tasks = ref<TaskTab[]>([])
  const activeTab = ref<string | null>(null)
  const materialsLoading = ref(false)

  watch(
    () => materials,
    () => {
      console.log("materials prop changed", materials)
    },
    { immediate: true, deep: true }
  )

  watch(
    () => selectedTechTasks,
    async (list) => {
      const prev = new Map(tasks.value.map((t) => [t.code, t]))
      tasks.value = list.map(
        (task) =>
          prev.get(task.code) ?? {
            code: task.code,
            materials: [
              {
                nomenclature_guid: "",
                nomenclature_name: "",
                assignment_code: task.code,
                quantity: 0,
              },
            ],
          }
      )

      // поддерживаем актуальный активный таб
      const codes = tasks.value.map((t) => t.code)

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
        activeTab.value = activeTab.value
      }
    },
    { immediate: true, deep: true }
  )

  const selectedMaterials = ref<MaterialItem[]>([])

  const emit = defineEmits<{
    (e: "update:materials", payload: MaterialItem[]): void
  }>()

  const materialOptions = ref<MaterialResponse[]>([])

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

  function addMaterial(tab: any) {
    tab.materials.push({
      nomenclature_guid: "",
      nomenclature_name: "",
      assignment_code: tab.code,
      quantity: 0,
    })
    syncSelected()
  }

  function pickMaterials(
    value: string,
    option: MaterialResponse,
    _tab: any,
    materialRow: any
  ) {
    materialRow.nomenclature_guid = value
    materialRow.assignment_code = _tab?.code ?? ""
    materialRow.nomenclature_name = option?.nomenclature_name ?? ""

    // Пересчитываем лимиты по всем строкам
    syncSelected()
  }

  function syncSelected() {
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

  async function getMaterialFrom1C() {
    materialsLoading.value = true
    try {
      if (materialOptions.value.length) {
        return
      }
      const response = await fetchMaterials(guid)

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
</script>
