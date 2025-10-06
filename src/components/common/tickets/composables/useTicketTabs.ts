import { computed } from "vue"
import type { TicketType } from "./useTicketData"

export interface TabConfig {
  name: TicketType
  label: string
  description?: string
}

export function useTicketTabs() {
  const tabs = computed<TabConfig[]>(() => [
    {
      name: "customer_call",
      label: "Вызовы",
      description: "Заявки от клиентов",
    },
    {
      name: "planned",
      label: "Плановые",
      description: "Плановые работы",
    },
  ])

  const getTabByType = (type: TicketType) => {
    return tabs.value.find((tab) => tab.name === type)
  }

  return {
    tabs,
    getTabByType,
  }
}
