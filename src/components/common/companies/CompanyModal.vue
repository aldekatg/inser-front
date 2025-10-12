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
        <n-form-item label="Название" path="name">
          <n-input
            v-model:value="props.form.name"
            placeholder="Введите название компании"
          />
        </n-form-item>
        <n-form-item label="БИН" path="bin">
          <n-input
            v-model:value="props.form.bin"
            placeholder="Введите БИН"
            maxlength="12"
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
  import { FormInst, useMessage } from "naive-ui"
  import { CompanyType } from "@/api/gas-stations/types.ts"

  const props = defineProps<{
    modelValue: boolean
    form: CompanyType
    isEdit: boolean
  }>()

  const emit = defineEmits(["save", "cancel"])

  const message = useMessage()
  const show = computed(() => props.modelValue)

  const formRef = ref<FormInst | null>(null)
  const isSubmitting = ref(false)

  const rules = {
    name: {
      required: true,
      message: "Название обязательно",
      trigger: ["blur", "input"],
    },
    bin: {
      required: true,
      message: "БИН обязателен",
      trigger: ["blur", "input"],
    },
  }

  watch(show, (newVal) => {
    if (!newVal) {
      props.form.bin = ""
      props.form.name = ""
    }
  })

  const handleSubmit = (e: MouseEvent) => {
    e.preventDefault()
    formRef.value?.validate(async (errors) => {
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
