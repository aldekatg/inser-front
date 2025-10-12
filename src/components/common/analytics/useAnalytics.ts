import { ref, computed } from "vue"
import { useMessage } from "naive-ui"
import { getTicketsReport, getWorkHoursReport } from "@/api/analytics"
import type {
  TicketReportItem,
  WorkHoursEmployee,
  WorkHoursTicket,
} from "@/api/analytics/types"
import ExcelJS from "exceljs"

export const useAnalytics = () => {
  const message = useMessage()
  const loading = ref(false)
  const dateRange = ref<[number, number] | null>(null)

  const formatDate = (date: number) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${day}.${month}.${year} ${hours}:${minutes}`
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      new: "Новая",
      in_progress: "В работе",
      awaiting_approval: "На согласовании",
      approved: "Одобрена",
      rejected: "Отклонена",
      closed: "Закрыта",
      cancelled: "Отменена",
      done_checked: "Выполнена (проверена)",
      done_unchecked: "Выполнена (не проверена)",
      rejected_by_customer: "Отклонена заказчиком",
    }
    return statusMap[status] || status
  }

  const getCriticalityLabel = (criticality: string) => {
    const criticalityMap: Record<string, string> = {
      critical: "Критичная",
      significant: "Значительная",
      serious: "Существенная",
      minor: "Незначительная",
      service_request: "Заявка на обслуживание",
      planned_maintenance: "Плановое обслуживание",
    }
    return criticalityMap[criticality] || criticality
  }

  const exportTicketsReport = async () => {
    if (!dateRange.value) {
      message.error("Пожалуйста, выберите период дат")
      return
    }

    loading.value = true

    try {
      const dateFrom = formatDate(dateRange.value[0])
      const dateTo = formatDate(dateRange.value[1])

      const response = await getTicketsReport(dateFrom, dateTo)
      const tickets = response.payload.payload

      if (!tickets || tickets.length === 0) {
        message.warning("Нет данных для выгрузки за выбранный период")
        loading.value = false
        return
      }

      // Создание workbook и worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Отчет по заявкам")

      // Определение колонок
      worksheet.columns = [
        { header: "Элемент №", key: "number", width: 12 },
        { header: "Участок", key: "region", width: 20 },
        { header: "Объект", key: "object", width: 15 },
        { header: "Статус", key: "status", width: 25 },
        { header: "Критичность", key: "criticality", width: 25 },
        { header: "Дата подачи заявки", key: "submitted", width: 20 },
        { header: "Дата закрытия заявки", key: "closed", width: 20 },
        { header: "Заявки", key: "tasks", width: 30 },
        { header: "ФИО", key: "employee", width: 30 },
        { header: "Содержание записи", key: "content", width: 30 },
        { header: "№ СЛ", key: "service_sheet", width: 10 },
        { header: "Исполнитель", key: "executor", width: 25 },
        { header: "Ответственный", key: "responsible", width: 25 },
        { header: "Примечание", key: "comment", width: 30 },
      ]

      // Стилизация заголовка
      worksheet.getRow(1).font = { bold: true, size: 12 }
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" },
      }
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      }

      // Функция для получения цвета строки по статусу
      const getStatusColor = (status: string): string => {
        const colorMap: Record<string, string> = {
          cancelled: "FFBDBDBD", // Серый - отменена
          rejected: "FFE57373", // Красный - отклонена
          rejected_by_customer: "FFEF5350", // Темно-красный - отклонена заказчиком
          done_checked: "FF81C784", // Ярко-зеленый - выполнена (проверена)
          done_unchecked: "FF9CCC65", // Светло-зеленый - выполнена (не проверена)
        }
        return colorMap[status] || "FFFFFFFF" // Белый по умолчанию
      }

      // Добавление данных с цветной стилизацией
      tickets.forEach((ticket: TicketReportItem, index: number) => {
        const row = worksheet.addRow({
          number: index + 1,
          region: ticket.region_name || "",
          object: ticket.gas_station_number || "",
          status: getStatusLabel(ticket.status),
          criticality: getCriticalityLabel(ticket.criticality),
          submitted: formatDateTime(ticket.submitted_at),
          closed: formatDateTime(ticket.closed_at),
          tasks: ticket.technical_tasks_preview?.join(", ") || "",
          employee: ticket.employee_name || "",
          content: ticket.content || "",
          service_sheet: ticket.service_sheet_number || "",
          executor: "",
          responsible: "",
          comment: ticket.comment || "",
        })

        // Применение цвета к строке
        const fillColor = getStatusColor(ticket.status)
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: fillColor },
          }
          cell.border = {
            top: { style: "thin", color: { argb: "FFD0D0D0" } },
            left: { style: "thin", color: { argb: "FFD0D0D0" } },
            bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
            right: { style: "thin", color: { argb: "FFD0D0D0" } },
          }
          cell.alignment = { vertical: "middle", wrapText: true }
        })
      })

      // Генерация файла
      const fileName = `Отчет_заявки_${dateFrom}_${dateTo}.xlsx`
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)

      message.success("Отчет успешно выгружен")
    } catch (error) {
      console.error("Ошибка при выгрузке отчета:", error)
      message.error("Ошибка при выгрузке отчета")
    } finally {
      loading.value = false
    }
  }

  const exportWorkHoursReport = async () => {
    if (!dateRange.value) {
      message.error("Пожалуйста, выберите период дат")
      return
    }

    loading.value = true

    try {
      const dateFrom = formatDate(dateRange.value[0])
      const dateTo = formatDate(dateRange.value[1])

      const response = await getWorkHoursReport(dateFrom, dateTo)
      const employees = response.employees

      if (!employees || employees.length === 0) {
        message.warning("Нет данных для выгрузки за выбранный период")
        loading.value = false
        return
      }

      // Создание workbook и worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Отчет по рабочим часам")

      // Определение колонок
      worksheet.columns = [
        { header: "Дата и время работ", key: "datetime", width: 25 },
        { header: "", key: "datetime_end", width: 25 },
        { header: "АЗС", key: "gas_station", width: 50 },
        { header: "Сервисный лист", key: "service_sheet", width: 20 },
        { header: "Время работы", key: "duration", width: 15 },
        { header: "Выполненные работы", key: "work_result", width: 40 },
      ]

      // Стилизация заголовка
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true, size: 12 }
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" },
      }
      headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
      }

      // Объединяем первые две колонки для заголовка "Дата и время работ"
      worksheet.mergeCells("A1:B1")
      worksheet.getCell("A1").value = "Дата и время работ"

      let currentRow = 2

      // Добавление данных по каждому сотруднику
      employees.forEach((employee: WorkHoursEmployee) => {
        // Заголовок с именем сотрудника
        const employeeHeaderRow = worksheet.getRow(currentRow)
        worksheet.mergeCells(`A${currentRow}:F${currentRow}`)
        employeeHeaderRow.getCell(1).value = employee.employee.full_name
        employeeHeaderRow.font = { bold: true, size: 14 }
        employeeHeaderRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE3F2FD" },
        }
        employeeHeaderRow.alignment = {
          vertical: "middle",
          horizontal: "left",
        }
        currentRow++

        let employeeTotalHours = 0

        // Добавление данных по каждому дню
        employee.days.forEach((day) => {
          day.tickets.forEach((ticket: WorkHoursTicket) => {
            const row = worksheet.getRow(currentRow)

            // Форматирование дат
            const startDate = new Date(ticket.work_started_at)
            const endDate = new Date(ticket.work_finished_at)

            const formatWorkDateTime = (date: Date) => {
              const day = String(date.getDate()).padStart(2, "0")
              const month = String(date.getMonth() + 1).padStart(2, "0")
              const year = date.getFullYear()
              const hours = String(date.getHours()).padStart(2, "0")
              const minutes = String(date.getMinutes()).padStart(2, "0")
              return `${day}.${month}.${year} ${hours}:${minutes}`
            }

            row.getCell(1).value = formatWorkDateTime(startDate)
            row.getCell(2).value = formatWorkDateTime(endDate)
            row.getCell(3).value =
              `${ticket.gas_station.object_number}, ${ticket.gas_station.address}`
            row.getCell(4).value = ticket.service_sheet_number?.toString() || ""
            row.getCell(5).value = ticket.duration_hours.toFixed(2)
            row.getCell(6).value = ticket.work_result || ""

            // Стилизация строки
            row.eachCell((cell) => {
              cell.border = {
                top: { style: "thin", color: { argb: "FFD0D0D0" } },
                left: { style: "thin", color: { argb: "FFD0D0D0" } },
                bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
                right: { style: "thin", color: { argb: "FFD0D0D0" } },
              }
              cell.alignment = { vertical: "middle", wrapText: true }
            })

            employeeTotalHours += ticket.duration_hours
            currentRow++
          })
        })

        // Итоговая строка для сотрудника
        const totalRow = worksheet.getRow(currentRow)
        worksheet.mergeCells(`A${currentRow}:D${currentRow}`)
        totalRow.getCell(1).value = `Итого за ${employee.employee.full_name}`
        totalRow.getCell(5).value = employeeTotalHours.toFixed(2)
        totalRow.font = { bold: true, size: 12 }
        totalRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF9C4" },
        }
        totalRow.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFD0D0D0" } },
            left: { style: "thin", color: { argb: "FFD0D0D0" } },
            bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
            right: { style: "thin", color: { argb: "FFD0D0D0" } },
          }
          cell.alignment = { vertical: "middle" }
        })
        currentRow++

        // Пустая строка между сотрудниками
        currentRow++
      })

      // Генерация файла
      const fileName = `Отчет_рабочие_часы_${dateFrom}_${dateTo}.xlsx`
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(url)

      message.success("Отчет успешно выгружен")
    } catch (error) {
      console.error("Ошибка при выгрузке отчета:", error)
      message.error("Ошибка при выгрузке отчета")
    } finally {
      loading.value = false
    }
  }

  const isDateRangeValid = computed(() => {
    return dateRange.value !== null && dateRange.value.length === 2
  })

  return {
    loading,
    dateRange,
    exportTicketsReport,
    exportWorkHoursReport,
    isDateRangeValid,
  }
}
