<template>
  <n-modal v-model:show="show">
    <n-card
      style="width: 600px"
      :title="isEdit ? 'Редактирование компании' : 'Создание компании'"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>Заполните поля</template>
      <n-form :model="props.form" :rules="rules" ref="formRef">
        <n-form-item label="Код" path="code">
          <n-input
            v-model:value="props.form.code"
            placeholder="Введите номер"
          />
        </n-form-item>
        <n-form-item label="Описание" path="description">
          <n-input
            v-model:value="props.form.description"
            type="textarea"
            placeholder="Введите описание"
          />
        </n-form-item>
        <n-form-item label="Выберите ТЗ" path="description">
          <n-select
            v-model:value="props.form.technical_task_id"
            :options="isTechTasks"
            :value-field="'id'"
            :label-field="'code'"
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
  import { WorkType } from "@/api/tariffs/types.ts"
  import { storeToRefs } from "pinia"
  import { useDictionaryStore } from "@/store/useDictionary.ts"

  const message = useMessage()
  const { isTechTasks } = storeToRefs(useDictionaryStore())

  const props = defineProps<{
    modelValue: boolean
    form: WorkType
    isEdit: boolean
  }>()

  const emit = defineEmits(["save", "cancel"])

  const show = computed(() => props.modelValue)

  const formRef = ref<FormInst | null>(null)
  const isSubmitting = ref(false)

  const rules = {
    code: {
      required: true,
      message: "Номер обязателен",
      trigger: ["blur", "input"],
    },
    description: {
      required: true,
      message: "Описание обязательно",
      trigger: ["blur", "input"],
    },
  }

  watch(show, (newVal) => {
    if (!newVal) {
      props.form.code = ""
      props.form.id = null
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
