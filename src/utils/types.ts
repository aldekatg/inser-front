export enum StatusType {
  NEW = "new", // Новый
  IN_PROGRESS = "in_progress", // В процессе
  AWAITING_APPROVAL = "awaiting_approval", // Ожидает утверждения
  DONE_CHECKED = "done_checked", // Выполнено (проверено)
  DONE_UNCHECKED = "done_unchecked", // Выполнено (не проверено)
  REJECTED_BY_CUSTOMER = "rejected_by_customer", // Отклонено заказчиком
}

export enum TicketCriticality {
  CRITICAL = "critical", // Критический
  SERIOUS = "serious", // Серьезный
  SIGNIFICANT = "significant", // Значительный
  MINOR = "minor", // Незначительный
  SERVICE_REQUEST = "service_request", // Запрос на обслуживание
  PLANNED_MAINTENANCE = "planned_maintenance", // Плановое обслуживание
}

export enum TicketSource {
  PLANNED = "planned", // Запланировано
  CUSTOMER_CALL = "customer_call", // Звонок клиента
}

export const TicketStatusDictionary = {
  StatusType: {
    [StatusType.NEW]: "Новый",
    [StatusType.IN_PROGRESS]: "В процессе",
    [StatusType.AWAITING_APPROVAL]: "Ожидает утверждения",
    [StatusType.DONE_CHECKED]: "Выполнено (проверено)",
    [StatusType.DONE_UNCHECKED]: "Выполнено (не проверено)",
    [StatusType.REJECTED_BY_CUSTOMER]: "Отклонено заказчиком",
  },
  TicketCriticality: {
    [TicketCriticality.CRITICAL]: "Критический",
    [TicketCriticality.SERIOUS]: "Серьезный",
    [TicketCriticality.SIGNIFICANT]: "Значительный",
    [TicketCriticality.MINOR]: "Незначительный",
    [TicketCriticality.SERVICE_REQUEST]: "Запрос на обслуживание",
    [TicketCriticality.PLANNED_MAINTENANCE]: "Плановое обслуживание",
  },
  TicketSource: {
    [TicketSource.PLANNED]: "Плановая",
    [TicketSource.CUSTOMER_CALL]: "Внеплановая",
  },
}
