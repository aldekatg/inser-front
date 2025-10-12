<template>
  <n-modal v-model:show="show">
    <n-card
      style="width: 600px"
      :title="isEdit ? 'Редактирование элемента' : 'Создание элемента'"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>Заполните поля</template>
      <n-form :model="props.form" :rules="rules" ref="formRef">
        <n-form-item label="ТЗ">
          <n-select
            v-model:value="selectedTechTask"
            placeholder="Выберите ТЗ"
            :options="technical_tasks"
            @focus="initChecklist"
            value-field="id"
            label-field="code"
          />
        </n-form-item>
        <n-form-item label="Чек-листы" path="checklist_id">
          <n-select
            v-model:value="props.form.checklist_id"
            placeholder="Выберите чек-лист"
            :options="filteredChecklists"
            value-field="id"
            label-field="description"
          />
        </n-form-item>
        <n-form-item label="Код" path="code">
          <n-input v-model:value="props.form.code" placeholder="Введите код" />
        </n-form-item>
        <n-form-item label="Описание" path="description">
          <n-input
            v-model:value="props.form.description"
            type="textarea"
            placeholder="Введите описание"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="emit('cancel')">Отмена</n-button>
          <n-button
            type="primary"
            @click="handleSubmit"
            :loading="isSubmitting"
          >
            Сохранить
          </n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue"
  import { defineProps, defineEmits } from "vue"
  import { useMessage, FormInst } from "naive-ui"
  import { ChecklistItemsPayload } from "@/api/gas-stations/types.ts"
  import { storeToRefs } from "pinia"
  import { useDictionaryStore } from "@/store/useDictionary.ts"
  import { useChecklistHelper } from "@/components/common/tariffs/checklists/useChecklistHelper.ts"

  const message = useMessage()
  const props = defineProps<{
    modelValue: boolean
    form: ChecklistItemsPayload
    isEdit: boolean
  }>()

  const { checklists, initChecklist } = useChecklistHelper()
  const { technical_tasks } = storeToRefs(useDictionaryStore())

  const emit = defineEmits(["save", "cancel"])

  const show = computed(() => props.modelValue)
  const isSubmitting = ref(false)
  const selectedTT = ref<number | null>(null)

  const formRef = ref<FormInst | null>(null)

  const filteredChecklists = computed(() => {
    return checklists.value?.filter(
      (c) => c.technical_task_id === selectedTT.value
    )
  })

  const rules = {
    checklist_id: {
      type: "number",
      required: true,
      message: "Выберите чек-лист",
      trigger: ["blur", "change"],
    },
    code: {
      required: true,
      message: "Код обязательно",
      trigger: ["blur", "input"],
    },
    description: {
      required: true,
      message: "Описание обязательно",
      trigger: ["blur", "input"],
    },
  }

  watch(show, (newVal) => {
    if (newVal && props.isEdit && props.form.checklist_id) {
      // При открытии в режиме редактирования устанавливаем ТЗ из чек-листа
      const checklist = checklists.value?.find(
        (c) => c.id === props.form.checklist_id
      )
      if (checklist) {
        selectedTT.value = checklist.technical_task_id
      }
    } else if (!newVal) {
      // При закрытии очищаем форму
      props.form.checklist_id = null
      props.form.code = ""
      props.form.description = ""
      selectedTT.value = null
    }
  })

  const handleSubmit = (e: MouseEvent) => {
    e.preventDefault()
    formRef.value?.validate(async (errors) => {
      console.log(errors)
      if (!errors) {
        isSubmitting.value = true
        emit("save", props.form)
        isSubmitting.value = false
      } else {
        message.error("Пожалуйста, заполните все обязательные поля")
      }
    })
  }

  const selectedTechTask = computed({
    get() {
      // Если уже выбран чек-лист, берем его technical_task_id
      if (props.form.checklist_id) {
        const checklist = checklists.value?.find(
          (c) => c.id === props.form.checklist_id
        )
        if (checklist) {
          return checklist.technical_task_id
        }
      }
      // Иначе возвращаем текущее выбранное значение
      return selectedTT.value
    },
    set(value) {
      selectedTT.value = value
      // При изменении ТЗ сбрасываем выбранный чек-лист
      if (props.form.checklist_id) {
        props.form.checklist_id = null
      }
    },
  })
</script>
