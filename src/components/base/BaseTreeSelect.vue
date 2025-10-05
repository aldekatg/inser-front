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
      cascade
      ref="treeRef"
      v-model:checked-keys="checkedKeys"
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

  /** Переводим preselected в checkedKeys для n-tree */
  function toCheckedKeys(
    pre: TechnicalTaskDetail[] | undefined,
    dict: TechnicalTaskDetail[]
  ): string[] {
    if (!pre || !pre.length) return []
    const dictMap = new Map<number, TechnicalTaskDetail>(
      dict.filter((tt) => tt.id != null).map((tt) => [tt.id!, tt])
    )
    const keys: string[] = []
    for (const tt of pre) {
      if (tt.id == null) continue
      const dictTT = dictMap.get(tt.id)
      if (!dictTT) continue
      const selectedChildren = tt.work_types?.map((w) => w.id) ?? []
      const dictChildrenCount = dictTT.work_types?.length ?? 0

      if (!selectedChildren.length) {
        // выбран просто парент
        keys.push(makeParentKey(tt.id))
      } else {
        // отмечены конкретные дети
        for (const cid of selectedChildren) keys.push(makeChildKey(tt.id, cid!))
        // если отмечены все дети — добавим парента (для каскада и удобства)
        if (
          dictChildrenCount > 0 &&
          selectedChildren.length === dictChildrenCount
        ) {
          keys.push(makeParentKey(tt.id))
        }
      }
    }
    return Array.from(new Set(keys))
  }

  const pattern = ref("")
  const treeData = computed<TreeOption[]>(() => toTree(props.source))
  const defaultExpanded = ref<string[]>([])
  const expandedKeys = ref<Array<string | number>>([])
  const treeRef = ref<TreeInst | null>(null)
  const checkedKeys = ref<string[]>([])
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

  /** Инициализируем checkedKeys из preselected и раскрываем родителей */
  watch(
    () => [props.preselected, props.source],
    () => {
      checkedKeys.value = toCheckedKeys(props.preselected, props.source)
      defaultExpanded.value = checkedKeys.value.filter((k) =>
        String(k).startsWith("tt:")
      ) as string[]
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
        map.set(pid, { all: true, set: new Set() })
      } else if (raw.startsWith("wt:")) {
        const [, p, c] = raw.split(":")
        const pid = Number(p),
          cid = Number(c)
        const cur = map.get(pid) ?? { all: false, set: new Set<number>() }
        if (!cur.all) cur.set.add(cid)
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
      .map((tt) => ({
        ...tt,
        work_types: sel.get(tt.id!)!.all
          ? tt.work_types
          : tt.work_types.filter((wt) => sel.get(tt.id!)!.set.has(wt.id!)),
      }))
    return toTree(filtered)
  })

  function onCheck(keys: Array<string | number>) {
    checkedKeys.value = keys as string[]

    // // Сохраняем состояние раскрытых узлов
    // expandedKeys.value = Array.from(
    //   new Set([
    //     ...expandedKeys.value,
    //     ...keys.filter((k) => String(k).startsWith("tt:")),
    //   ])
    // )

    // Формируем результат для эмита
    const selected = new Map<number, SelectedEntry>() // parentId -> { all | set(childIds) }

    for (const raw of keys as string[]) {
      if (raw.startsWith("tt:")) {
        const pid = Number(raw.split(":")[1])
        selected.set(pid, { all: true, set: new Set() })
      } else if (raw.startsWith("wt:")) {
        const [, p, c] = raw.split(":")
        const pid = Number(p),
          cid = Number(c)
        const cur = selected.get(pid) ?? { all: false, set: new Set<number>() }
        if (!cur.all) cur.set.add(cid)
        selected.set(pid, cur)
      }
    }

    const result: TechnicalTaskDetail[] = props.source
      .filter((tt) => tt.id != null && selected.has(tt.id))
      .map((tt) => {
        const entry = selected.get(tt.id!)!
        const work_types = entry.all
          ? tt.work_types
          : tt.work_types.filter((wt) => entry.set.has(wt.id!))
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
