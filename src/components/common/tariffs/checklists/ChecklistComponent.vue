<template>
  <div class="checklists-component">
    <n-tabs type="line" animated>
      <n-tab-pane name="checklists" tab="Чек-листы">
        <n-button
          style="margin-bottom: 10px"
          type="primary"
          @click="openChecklist"
        >
          Добавить чек-лист
        </n-button>
        <n-data-table
          :loading="loading"
          :columns="columnChecklists"
          :data="checklists"
        />
      </n-tab-pane>
      <n-tab-pane name="check-items" tab="Наполнение">
        <n-button
          style="margin-bottom: 10px"
          type="primary"
          @click="openChecklistItems"
        >
          Добавить элемент
        </n-button>
        <n-data-table
          :loading="loading"
          :columns="columnChecklistItems"
          :data="checklistItems"
        />
      </n-tab-pane>
    </n-tabs>
  </div>
  <ChecklistModal
    :form="checklistForm"
    :model-value="isModalOpen"
    :is-edit="!!checklistForm.id"
    @cancel="closeModal"
    @save="
      (data) => {
        createChecklist(data, !!checklistForm.id ? 'edit' : 'create')
        closeModal()
      }
    "
  />
  <ChecklistItemsModal
    :form="checklistItemForm"
    :model-value="isItemModalOpen"
    :is-edit="!!checklistItemForm.id"
    @cancel="closeItemModal"
    @save="
      (data) => {
        createChecklistItems(data, !!checklistItemForm.id ? 'edit' : 'create')
        closeItemModal()
      }
    "
  />
</template>

<style scoped lang="scss">
  .checklists-component {
    padding: rem(20);
  }
</style>
<script setup lang="ts">
  import { useChecklistHelper } from "@/components/common/tariffs/checklists/useChecklistHelper.ts"
  import ChecklistModal from "@/components/common/tariffs/checklists/ChecklistModal.vue"
  import { NButton } from "naive-ui"
  import ChecklistItemsModal from "@/components/common/tariffs/checklists/ChecklistItemsModal.vue"
  import { ActionButtons } from "@/utils"
  import {
    PencilSharp as PencilIcon,
    TrashOutline as TrashIcon,
  } from "@vicons/ionicons5"

  const isModalOpen = ref(false)
  const isItemModalOpen = ref(false)

  const closeModal = () => {
    checklistForm.value = {
      id: null,
      technical_task_id: null,
      description: "",
    }
    isModalOpen.value = false
  }
  const closeItemModal = () => {
    checklistItemForm.value = {
      id: null,
      checklist_id: null,
      code: "",
      description: "",
    }
    isItemModalOpen.value = false
  }

  const openChecklist = () => {
    isModalOpen.value = true
  }
  const openChecklistItems = () => {
    isItemModalOpen.value = true
  }

  const {
    loading,

    checklistForm,
    checklistItemForm,

    checklists,
    initChecklistItems,
    initChecklist,
    checklistItems,

    createChecklist,
    createChecklistItems,

    deleteChecklistUniFunc,
  } = useChecklistHelper()

  const columnChecklists = [
    {
      title: "ID",
      key: "id",
      width: 50,
    },
    {
      title: "Описание",
      width: "70%",
      key: "description",
    },
    {
      title: "Действия",
      key: "actions",
      align: "center",
      fixed: "right",
      className: "custom-buttons",
      render(row: any) {
        return ActionButtons([
          {
            icon: PencilIcon,
            type: "info",
            onClick: () => {
              checklistForm.value = { ...row }
              isModalOpen.value = true
            },
          },
          {
            icon: TrashIcon,
            type: "error",
            style: "marginLeft: 8px",
            onClick: () => deleteChecklistUniFunc(row, "checklists"),
          },
        ])
      },
    },
  ]
  const columnChecklistItems = [
    {
      title: "ID",
      key: "id",
      width: 50,
    },
    {
      title: "Код",
      key: "code",
    },
    {
      title: "Описание",
      width: "60%",
      key: "description",
    },
    {
      title: "Действия",
      key: "actions",
      fixed: "right",
      className: "custom-buttons",
      render(row: any) {
        return ActionButtons([
          {
            icon: PencilIcon,
            type: "info",
            onClick: () => {
              checklistItemForm.value = { ...row }
              isItemModalOpen.value = true
            },
          },
          {
            icon: TrashIcon,
            type: "error",
            onClick: () => deleteChecklistUniFunc(row, "items"),
          },
        ])
      },
    },
  ]

  onMounted(() => {
    initChecklistItems()
    initChecklist()
  })
</script>
