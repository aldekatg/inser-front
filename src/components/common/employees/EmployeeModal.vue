<template>
  <n-modal v-model:show="show">
    <n-card
      style="width: 800px"
      :title="isEdit ? 'Редактирование сотрудника' : 'Создание сотрудника'"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>Заполните поля</template>
      <n-form
        :model="props.form"
        :rules="rules"
        ref="formRef"
        class="grid-form"
      >
        <n-form-item label="ИИН" path="iin">
          <n-input
            v-model:value="props.form.iin"
            placeholder="Введите ИИН"
            maxlength="12"
          />
        </n-form-item>
        <n-form-item label="Номер телефона" path="phone">
          <n-input-group>
            <vue-tel-input
              maxlength="15"
              v-model="props.form.phone"
              class="phone-input"
            ></vue-tel-input>
          </n-input-group>
        </n-form-item>
        <n-form-item label="Имя" path="full_name">
          <n-input
            v-model:value="props.form.full_name"
            placeholder="Введите имя"
          />
        </n-form-item>
        <n-form-item label="Почта" path="email">
          <n-input
            v-model:value="props.form.email"
            type="text"
            placeholder="Введите email"
          />
        </n-form-item>
        <n-form-item label="Роль" path="role">
          <n-select
            v-model:value="props.form.role"
            :options="rolesOptions"
            :value-field="'value'"
            :label-field="'label'"
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
        <n-form-item label="Склад" path="warehouse_id">
          <n-select
            v-model:value="props.form.warehouse_id"
            :options="isWarehouses"
            :value-field="'id'"
            :label-field="'name'"
            placeholder="Выберите склад"
          />
        </n-form-item>
        <n-form-item label="Руководитель" path="parent_id">
          <n-select
            v-model:value="props.form.parent_id"
            :options="isParentId"
            :value-field="'id'"
            :label-field="'full_name'"
            placeholder="Выберите руководителя"
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
  import { useDictionaryStore } from "@/store/useDictionary.ts"
  import { storeToRefs } from "pinia"
  import { EmployeePayload, EmployeeRoles } from "@/api/employees/types.ts"
  import { useEmployees } from "@/components/common/employees/useEmployees.ts"

  const message = useMessage()
  const { employees } = useEmployees()
  const { isRegions, isWarehouses } = storeToRefs(useDictionaryStore())

  const props = defineProps<{
    modelValue: boolean
    form: EmployeePayload
    isEdit: boolean
  }>()

  const emit = defineEmits(["save", "cancel"])

  const show = computed(() => props.modelValue)

  const formRef = ref<FormInst | null>(null)
  const isSubmitting = ref(false)

  const isParentId = computed(() =>
    employees.value.filter((emp) => emp.id !== props.form.id)
  )

  const rules = {
    iin: {
      max: 12,
      required: true,
      message: "ИИН обязателен",
      trigger: ["blur", "input"],
    },
    phone: {
      required: true,
      message: "Номер телефона обязателен",
      trigger: ["blur", "input"],
    },
    region_id: {
      type: "number",
      required: false,
      message: "Регион обязателен",
      trigger: ["blur", "change"],
    },
    full_name: {
      required: true,
      message: "Имя сотрудника обязательно",
      trigger: ["blur", "input"],
    },
    role: {
      required: true,
      min: 6,
      message: "Роль обязательна",
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
    password: {
      required: !props.isEdit,
      min: 6,
      message: "Пароль обязателен",
      trigger: ["blur", "input"],
    },
  }

  watch(show, (newVal) => {
    if (!newVal) {
      props.form.iin = ""
      props.form.phone = ""
      props.form.region_id = undefined
      props.form.full_name = ""
      props.form.password = ""
      props.form.email = ""
      props.form.id = null
      props.form.parent_id = undefined
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

  const rolesOptions = Object.entries(EmployeeRoles).map(([key, value]) => ({
    label: value,
    value: key,
  }))
</script>

<style lang="scss" scoped>
  :deep(.phone-input) {
    height: 34px;
  }

  .grid-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: rem(10);
  }
</style>
