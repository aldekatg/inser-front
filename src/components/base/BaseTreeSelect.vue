<template>
  <div class="tree-component">
    <n-input
      v-model:value="pattern"
      placeholder="Поиск технического задания"
      clearable
    />
    <n-tree
      block-line
      :checkable="isEdit"
      ref="treeRef"
      v-model:checked-keys="checkedKeys"
      v-model:indeterminate-keys="indeterminateKeys"
      v-model:expanded-keys="expandedKeys"
      :pattern="pattern"
      :data="displayTreeData"
      :show-irrelevant-nodes="false"
      :default-expanded-keys="defaultExpanded"
      @update:checked-keys="onCheck"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue"
  import type { TreeOption, TreeInst } from "naive-ui"
  import { TechnicalTaskDetail } from "@/api/tickets/types.ts"

  const props = defineProps<{
    source: TechnicalTaskDetail[] // словарь (полное дерево)
    preselected?: TechnicalTaskDetail[] // предзаполнение с бэка
    editMode?: boolean // режим редактирования (по умолчанию true)
  }>()

  const emit = defineEmits<{
    (e: "update:selectedKeys", data: TechnicalTaskDetail[]): void
  }>()

  const makeParentKey = (pid: number) => `tt:${pid}`
  const makeChildKey = (pid: number, cid: number) => `wt:${pid}:${cid}`

  /** Переводим preselected в checkedKeys и indeterminateKeys для n-tree */
  function toCheckedKeys(
    pre: TechnicalTaskDetail[] | undefined,
    dict: TechnicalTaskDetail[]
  ): { checked: string[]; indeterminate: string[] } {
    if (!pre || !pre.length) return { checked: [], indeterminate: [] }
    const dictMap = new Map<number, TechnicalTaskDetail>(
      dict.filter((tt) => tt.id != null).map((tt) => [tt.id!, tt])
    )
    const checked: string[] = []
    const indeterminate: string[] = []

    for (const tt of pre) {
      if (tt.id == null) continue
      const dictTT = dictMap.get(tt.id)
      if (!dictTT) continue
      const selectedChildren = tt.work_types?.map((w) => w.id) ?? []
      const totalChildren = dictTT.work_types?.length ?? 0

      if (!selectedChildren.length) {
        // выбран только родитель без детей
        checked.push(makeParentKey(tt.id))
      } else if (
        selectedChildren.length === totalChildren &&
        totalChildren > 0
      ) {
        // выбраны все дети - отмечаем родителя как полностью выбранного
        checked.push(makeParentKey(tt.id))
        for (const cid of selectedChildren)
          checked.push(makeChildKey(tt.id, cid!))
      } else {
        // выбраны некоторые дети - родитель в indeterminate
        indeterminate.push(makeParentKey(tt.id))
        for (const cid of selectedChildren)
          checked.push(makeChildKey(tt.id, cid!))
      }
    }
    return {
      checked: Array.from(new Set(checked)),
      indeterminate: Array.from(new Set(indeterminate)),
    }
  }

  const pattern = ref("")
  const treeData = computed<TreeOption[]>(() => toTree(props.source))
  const defaultExpanded = ref<string[]>([])
  const expandedKeys = ref<Array<string | number>>([])
  const treeRef = ref<TreeInst | null>(null)
  const checkedKeys = ref<string[]>([])
  const indeterminateKeys = ref<string[]>([])
  const isEdit = computed(() => props.editMode)

  function toTree(data: TechnicalTaskDetail[]): TreeOption[] {
    return data.map((tt) => ({
      key: makeParentKey(tt.id!),
      label: tt.code + " - " + tt.description.slice(0, 100),
      children: tt.work_types?.length
        ? tt.work_types.map((wt) => ({
            key: makeChildKey(tt.id!, wt.id!),
            label: wt.code + " - " + wt.description.slice(0, 100),
            isLeaf: true,
          }))
        : undefined,
      isLeaf: !tt.work_types?.length,
    }))
  }

  /** Инициализируем checkedKeys и indeterminateKeys из preselected и раскрываем родителей */
  watch(
    () => [props.preselected, props.source],
    () => {
      const keys = toCheckedKeys(props.preselected, props.source)
      checkedKeys.value = keys.checked
      indeterminateKeys.value = keys.indeterminate
      defaultExpanded.value = [
        ...keys.checked.filter((k) => String(k).startsWith("tt:")),
        ...keys.indeterminate,
      ] as string[]
    },
    { immediate: true, deep: true }
  )

  // карта выбранных узлов по ключам
  type SelectedEntry = { all: boolean; set: Set<number> }
  function buildSelectedMap(keys: string[]): Map<number, SelectedEntry> {
    const map = new Map<number, SelectedEntry>()
    for (const raw of keys) {
      if (raw.startsWith("tt:")) {
        const pid = Number(raw.split(":")[1])
        // Проверяем, есть ли дети для этого родителя в keys
        const hasChildren = keys.some((k) => k.startsWith(`wt:${pid}:`))
        // Если детей нет, родитель выбран сам по себе без work_types
        if (!hasChildren) {
          map.set(pid, { all: false, set: new Set() })
        }
      } else if (raw.startsWith("wt:")) {
        const [, p, c] = raw.split(":")
        const pid = Number(p),
          cid = Number(c)
        const cur = map.get(pid) ?? { all: false, set: new Set<number>() }
        cur.set.add(cid)
        map.set(pid, cur)
      }
    }
    return map
  }

  /** Дерево для отображения: в режиме чтения показываем только выбранные узлы */
  const displayTreeData = computed<TreeOption[]>(() => {
    if (isEdit.value) return treeData.value
    const sel = buildSelectedMap(checkedKeys.value)
    const filtered = props.source
      .filter((tt) => tt.id != null && sel.has(tt.id!))
      .map((tt) => {
        const entry = sel.get(tt.id!)!
        // Показываем только выбранные work_types (или пустой массив)
        const work_types = tt.work_types.filter((wt) => entry.set.has(wt.id!))
        return { ...tt, work_types }
      })
    return toTree(filtered)
  })

  function onCheck(keys: Array<string | number>) {
    checkedKeys.value = keys as string[]

    // Вычисляем indeterminate keys (родители с частично выбранными детьми)
    const newIndeterminate: string[] = []
    const selected = new Map<number, SelectedEntry>() // parentId -> { all | set(childIds) }

    // Собираем информацию о выбранных узлах
    for (const raw of keys as string[]) {
      if (raw.startsWith("tt:")) {
        const pid = Number(raw.split(":")[1])
        // Проверяем, есть ли дети для этого родителя в checkedKeys
        const hasChildren = (keys as string[]).some(
          (k) => typeof k === "string" && k.startsWith(`wt:${pid}:`)
        )
        // Если детей нет, это означает что выбран только родитель без work_types
        if (!hasChildren) {
          selected.set(pid, { all: false, set: new Set() })
        }
      } else if (raw.startsWith("wt:")) {
        const [, p, c] = raw.split(":")
        const pid = Number(p),
          cid = Number(c)
        const cur = selected.get(pid) ?? { all: false, set: new Set<number>() }
        cur.set.add(cid)
        selected.set(pid, cur)
      }
    }

    // Вычисляем indeterminate для родителей с частично выбранными детьми
    for (const tt of props.source) {
      if (tt.id == null) continue
      const entry = selected.get(tt.id)
      if (!entry) continue

      const totalChildren = tt.work_types?.length ?? 0
      const selectedChildrenCount = entry.set.size
      const parentKey = makeParentKey(tt.id)
      const isParentChecked = (keys as string[]).includes(parentKey)

      // Если выбраны некоторые (но не все) дети и родитель не выбран отдельно
      if (
        selectedChildrenCount > 0 &&
        selectedChildrenCount < totalChildren &&
        !isParentChecked
      ) {
        newIndeterminate.push(parentKey)
      }
      // Если выбраны все дети, родитель должен быть checked, а не indeterminate
      else if (
        selectedChildrenCount === totalChildren &&
        totalChildren > 0 &&
        !isParentChecked
      ) {
        // Автоматически добавляем родителя в checked
        checkedKeys.value = [...checkedKeys.value, parentKey] as string[]
        selected.set(tt.id, { all: false, set: entry.set }) // обновляем выбор
      }
    }

    indeterminateKeys.value = newIndeterminate

    const result: TechnicalTaskDetail[] = props.source
      .filter((tt) => tt.id != null && selected.has(tt.id))
      .map((tt) => {
        const entry = selected.get(tt.id!)!
        // Берем только выбранные work_types (или пустой массив если set пустой)
        const work_types = tt.work_types.filter((wt) => entry.set.has(wt.id!))
        return { ...tt, work_types }
      })

    emit("update:selectedKeys", result)
  }
</script>

<style scoped lang="scss">
  .tree-component {
    flex-direction: column;
    display: flex;
    gap: rem(20);
    min-height: rem(150);
  }
</style>
