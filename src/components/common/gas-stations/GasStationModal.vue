<template>
  <n-modal v-model:show="show">
    <n-card
      style="width: 600px"
      :title="isEdit ? 'Редактирование АЗС' : 'Создание АЗС'"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>Заполните поля</template>
      <n-form :model="props.form" :rules="rules" ref="formRef">
        <n-form-item label="GUID" v-if="isEdit">
          <n-input v-model:value="props.form.guid" readonly disabled />
        </n-form-item>
        <n-form-item label="Номер объекта" path="object_number">
          <n-input
            v-model:value="props.form.object_number"
            placeholder="Введите номер объекта"
          />
        </n-form-item>
        <n-form-item label="Адрес" path="address">
          <n-input
            v-model:value="props.form.address"
            placeholder="Введите адрес"
          />
        </n-form-item>
        <n-form-item label="Оператор" path="operator_name">
          <n-input
            v-model:value="props.form.operator_name"
            placeholder="Введите имя оператора"
          />
        </n-form-item>
        <n-form-item label="Почта" path="email">
          <n-input
            v-model:value="props.form.email"
            type="email"
            placeholder="Введите email"
          />
        </n-form-item>
        <n-form-item label="Компания" path="company_id">
          <n-select
            v-model:value="props.form.company_id"
            :value-field="'id'"
            :label-field="'name'"
            :options="isCompanies"
            placeholder="Выберите компанию"
          />
        </n-form-item>
        <n-form-item label="Регион" path="region_id">
          <n-select
            v-model:value="props.form.region_id"
            :options="isRegions"
            :value-field="'id'"
            :label-field="'name'"
            placeholder="Выберите регион"
          />
        </n-form-item>

        <n-form-item label="Пароль" path="password" v-if="!props.isEdit">
          <n-input
            minlength="6"
            v-model:value="props.form.password"
            placeholder="Введите пароль"
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
  import { regEmail } from "@/components/common/gas-stations/const.ts"
  import { GasStationPayload } from "@/api/gas-stations/types.ts"
  import { useDictionaryStore } from "@/store/useDictionary.ts"
  import { storeToRefs } from "pinia"

  const message = useMessage()
  const { isCompanies, isRegions } = storeToRefs(useDictionaryStore())

  const props = defineProps<{
    modelValue: boolean
    form: GasStationPayload
    isEdit: boolean
  }>()

  const emit = defineEmits(["save", "cancel"])

  const show = computed(() => props.modelValue)

  const formRef = ref<FormInst | null>(null)
  const isSubmitting = ref(false)

  const rules = {
    object_number: {
      required: true,
      message: "Номер объекта обязателен",
      trigger: ["blur", "input"],
    },
    address: {
      required: true,
      message: "Адрес обязателен",
      trigger: ["blur", "input"],
    },
    region_id: {
      type: "number",
      required: true,
      message: "Регион обязателен",
      trigger: ["blur", "change"],
    },
    operator_name: {
      required: true,
      message: "Имя оператора обязательно",
      trigger: ["blur", "input"],
    },
    password: {
      required: !props.isEdit,
      min: 6,
      message: "Пароль обязателен",
      trigger: ["blur", "input"],
    },
    email: {
      required: true,
      type: "email",
      message: "Email обязателен",
      validator(_: unknown, value: string) {
        console.log(_)
        if (value && !regEmail.test(value)) {
          return new Error("Введите верный формат email")
        }
      },
      trigger: ["blur", "input"],
    },
    company_id: {
      type: "number",
      required: true,
      message: "Компания обязательна",
      trigger: ["blur", "change"],
    },
  }

  watch(show, (newVal) => {
    if (!newVal) {
      props.form.object_number = ""
      props.form.address = ""
      props.form.region_id = null
      props.form.operator_name = ""
      props.form.password = ""
      props.form.email = ""
      props.form.id = null
      props.form.company_id = null
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
