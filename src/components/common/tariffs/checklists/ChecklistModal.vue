<template>
  <n-modal v-model:show="show">
    <n-card
      style="width: 600px"
      :title="isEdit ? 'Редактирование чек-лист' : 'Создание чек-лист'"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>Заполните поля</template>
      <n-form :model="props.form" :rules="rules" ref="formRef">
        <n-form-item label="ТЗ" path="technical_task_id">
          <n-select
            v-model:value="props.form.technical_task_id"
            placeholder="Выберите ТЗ"
            :options="technical_tasks"
            value-field="id"
            label-field="code"
          />
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
  import { ChecklistPayload } from "@/api/gas-stations/types.ts"
  import { useDictionaryStore } from "@/store/useDictionary.ts"
  import { storeToRefs } from "pinia"

  const message = useMessage()
  const { technical_tasks } = storeToRefs(useDictionaryStore())
  const props = defineProps<{
    modelValue: boolean
    form: ChecklistPayload
    isEdit: boolean
  }>()

  const emit = defineEmits(["save", "cancel"])

  const show = computed(() => props.modelValue)

  const formRef = ref<FormInst | null>(null)
  const isSubmitting = ref(false)

  const rules = {
    technical_task_id: {
      required: true,
      type: "number",
      message: "Выберите ТЗ",
      trigger: ["blur", "change"],
    },
    description: {
      required: true,
      message: "Описание обязательно",
      trigger: ["blur", "input"],
    },
  }

  watch(show, (newVal) => {
    if (!newVal) {
      props.form.technical_task_id = null
      props.form.description = ""
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
</script>
