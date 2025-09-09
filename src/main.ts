import "./styles/index.scss"
import App from "./App.vue"
import { createApp } from "vue"
import { createPinia } from "pinia"
import { router } from "@/router/router.ts"
import VueTelInput from "vue-tel-input"
import "vue-tel-input/vue-tel-input.css"

const globalOptions = {
  mode: "auto",
  preferredCountries: ["kz"],
  autoFormat: true,
  defaultCountry: "KZ",
  dropdownOptions: {
    showSearchBox: true,
  },

  inputOptions: {
    maxlength: 15,
    placeholder: "Введите номер телефона",
  },
}

const app = createApp(App)
const pinia = createPinia()

app
  .use(router)
  .use(pinia)
  // @ts-ignore
  .use(VueTelInput, globalOptions)
  .mount("#app")
