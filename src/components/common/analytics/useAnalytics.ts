import { ref, computed } from "vue"
import { useMessage } from "naive-ui"
import {
  getTicketsReport,
  getWorkHoursReport,
  getSlaReport,
} from "@/api/analytics"
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
        { header: "Элемент №", key: "ticket", width: 12 },
        { header: "Участок", key: "region", width: 20 },
        { header: "Объект", key: "object", width: 15 },
        { header: "Статус", key: "status", width: 25 },
        { header: "Критичность", key: "criticality", width: 25 },
        { header: "Дата подачи заявки", key: "submitted", width: 20 },
        { header: "Дата закрытия заявки", key: "closed", width: 20 },
        { header: "Заявки", key: "tasks", width: 30 },
        { header: "Содержание записи", key: "content", width: 30 },
        { header: "№ СЛ", key: "service_sheet", width: 10 },
        { header: "Исполнитель", key: "employee", width: 25 },
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
          ticket: ticket.ticket_number,
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

  const exportSlaReport = async () => {
    if (!dateRange.value) {
      message.error("Пожалуйста, выберите период дат")
      return
    }

    loading.value = true
    try {
      const dateFrom = formatDate(dateRange.value[0])
      const dateTo = formatDate(dateRange.value[1])

      // Ожидаем структуру как ты прислал в примере
      const response = await getSlaReport(dateFrom, dateTo)

      const workbook = new ExcelJS.Workbook()
      const ws = workbook.addWorksheet("Отчет по SLA")

      // Утилиты
      const fmtDate = (s: string) => {
        const d = new Date(s)
        const dd = String(d.getDate()).padStart(2, "0")
        const mm = String(d.getMonth() + 1).padStart(2, "0")
        const yy = d.getFullYear()
        return `${dd}.${mm}.${yy}`
      }
      const borderThin = {
        top: { style: "thin" as const },
        left: { style: "thin" as const },
        bottom: { style: "thin" as const },
        right: { style: "thin" as const },
      }
      const headFill = {
        type: "pattern" as const,
        pattern: "solid" as const,
        fgColor: { argb: "FFD9D9D9" },
      }
      const setWrap = (cell: ExcelJS.Cell, center = true) => {
        cell.alignment = {
          wrapText: true,
          vertical: "middle",
          horizontal: center ? "center" : "left",
        }
      }
      const pick = (obj: any, path: string[], digits = 2): string => {
        try {
          const val = path.reduce((acc, k) => acc?.[k] ?? undefined, obj)
          if (val === undefined || val === null) return "–"
          if (typeof val === "number") return val.toFixed(digits)
          return `${val}`
        } catch {
          return "–"
        }
      }

      // Заголовок
      ws.mergeCells("A1:L1")
      const title = ws.getCell("A1")
      title.value = `Отчет по ТО и Р с учетом требуемого уровня сервиса за ${fmtDate(response.period.from)} - ${fmtDate(response.period.to)}`
      title.font = { bold: true, size: 14 }
      title.alignment = { horizontal: "center", vertical: "middle" }
      ws.getRow(1).height = 24

      // Блок totals
      let r = 3
      const totalsRows: Array<[string, string]> = [
        ["Общее количество заявок за период", `${response.totals.all} шт.`],
        [
          "Общее количество незакрытых заявок за период",
          `${response.totals.unclosed} шт.`,
        ],
        [
          "Количество выполненных внеплановых заявок",
          `${response.totals.completed_customer_call} шт.`,
        ],
        [
          "Количество невыполненных внеплановых заявок",
          `${response.totals.uncompleted_customer_call} шт.`,
        ],
        [
          "Количество выполненных внеплановых заявок с требуемым уровнем сервиса",
          `${response.totals.completed_customer_call_sla} шт.`,
        ],
        [
          "Количество выполненных плановых заявок",
          `${response.totals.completed_planned} шт.`,
        ],
        [
          "Количество невыполненных плановых заявок",
          `${(response?.totals?.all ?? 0) - (response?.totals?.completed_planned ?? 0)} шт.`,
        ], // если нужно именно «невыполненных плановых»
        [
          "Количество выполненных плановых заявок с требуемым уровнем сервиса",
          `${response.totals.completed_planned_sla} шт.`,
        ],
      ]

      // Колонки под totals: A (текст) и B (значение)
      ws.getColumn(1).width = 55
      ws.getColumn(2).width = 22

      totalsRows.forEach(([label, val]) => {
        ws.getCell(`A${r}`).value = label
        ws.getCell(`B${r}`).value = val
        ws.getCell(`B${r}`).border = borderThin
        setWrap(ws.getCell(`A${r}`), false)
        setWrap(ws.getCell(`B${r}`))
        r++
      })

      r += 2 // отступ перед основной таблицей

      // Шапка основной таблицы
      const headerTop = r
      // Название параметра
      ws.mergeCells(`A${headerTop}:A${headerTop + 1}`)
      ws.getCell(`A${headerTop}`).value =
        "Наименование параметра оценки работы СТОPO/ сторонней сервисной организации"
      // Метод расчета
      ws.mergeCells(`B${headerTop}:B${headerTop + 1}`)
      ws.getCell(`B${headerTop}`).value = "Метод расчета"
      // Плановое значение
      ws.mergeCells(`C${headerTop}:E${headerTop}`)
      ws.getCell(`C${headerTop}`).value = "Плановое значение*"
      // Допустимое отклонение
      ws.mergeCells(`F${headerTop}:H${headerTop}`)
      ws.getCell(`F${headerTop}`).value = "Допустимое отклонение"
      // Фактическое
      ws.mergeCells(`I${headerTop}:K${headerTop}`)
      ws.getCell(`I${headerTop}`).value = "Фактическое значение"
      // Вес
      ws.mergeCells(`L${headerTop}:L${headerTop + 1}`)
      ws.getCell(`L${headerTop}`).value = "Вес"

      // Подзаголовки SL1..SL3
      const labels = ["SL1", "SL2", "SL3"]
      ;["C", "D", "E"].forEach(
        (col, i) => (ws.getCell(`${col}${headerTop + 1}`).value = labels[i])
      )
      ;["F", "G", "H"].forEach(
        (col, i) => (ws.getCell(`${col}${headerTop + 1}`).value = labels[i])
      )
      ;["I", "J", "K"].forEach(
        (col, i) => (ws.getCell(`${col}${headerTop + 1}`).value = labels[i])
      )

      // Стили шапки
      for (let c = 1; c <= 12; c++) {
        ;[headerTop, headerTop + 1].forEach((rr) => {
          const cell = ws.getCell(rr, c)
          cell.fill = headFill
          cell.font = { bold: true }
          cell.border = borderThin
          setWrap(cell)
        })
      }

      r = headerTop + 2

      // Таблица (группы)
      type RowDef = {
        method: string
        planned: [string, string, string]
        deviation: [string, string, string]
        actualPaths: [string[], string[], string[]]
        info?: string
      }
      type Group = {
        name: string
        weight: string
        rows: RowDef[]
      }

      const dash = "–"
      const group1: Group = {
        name: "Среднее время выполнения внеплановых заявок по категориям",
        weight: "0,25",
        rows: [
          {
            method:
              "Частное суммы времени выполнения внеплановых запросов с приоритетом «Критический» к общему количеству запросов с приоритетом «Критический»",
            planned: ["3 ч", "5 ч", "8 ч"],
            deviation: ["10%", dash, dash],
            actualPaths: [
              ["avg_duration_hours", "critical", "sl1"],
              ["avg_duration_hours", "critical", "sl2"],
              ["avg_duration_hours", "critical", "sl3"],
            ],
          },
          {
            method:
              "Частное суммы времени выполнения внеплановых запросов с приоритетом «Серьезный» к общему количеству запросов с приоритетом «Серьезный»",
            planned: ["5 ч", "7 ч", "10 ч"],
            deviation: ["10%", dash, dash],
            actualPaths: [
              ["avg_duration_hours", "serious", "sl1"],
              ["avg_duration_hours", "serious", "sl2"],
              ["avg_duration_hours", "serious", "sl3"],
            ],
          },
          {
            method:
              "Частное суммы времени выполнения внеплановых запросов с приоритетом «Существенный» к общему количеству запросов с приоритетом «Существенный»",
            planned: ["7 ч", "9 ч", "12 ч"],
            deviation: ["10%", dash, dash],
            actualPaths: [
              ["avg_duration_hours", "significant", "sl1"],
              ["avg_duration_hours", "significant", "sl2"],
              ["avg_duration_hours", "significant", "sl3"],
            ],
          },
          {
            method:
              "Частное суммы времени выполнения внеплановых запросов с приоритетом «Минимальный» к общему количеству запросов с приоритетом «Минимальный»",
            planned: [dash, dash, dash],
            deviation: ["10%", dash, dash],
            actualPaths: [
              ["avg_duration_hours", "minor", "sl1"],
              ["avg_duration_hours", "minor", "sl2"],
              ["avg_duration_hours", "minor", "sl3"],
            ],
            info: "Нормативное время выполнения – по согласованию с Заказчиком, но не более 120 часов. Нормативные сервисные часы – с 6:00 до 18:00, пн.-пт.",
          },
        ],
      }

      const group2: Group = {
        name: "Среднее время выполнения планового обслуживания",
        weight: "0,25",
        rows: [
          {
            method:
              "Частное суммы времени выполнения планового ТО и Р к общему количеству плановых заявок на ТО и Р",
            planned: [dash, dash, dash],
            deviation: ["10%", dash, dash],
            actualPaths: [
              ["avg_duration_hours", "planned_maintenance", "sl1"],
              ["avg_duration_hours", "planned_maintenance", "sl2"],
              ["avg_duration_hours", "planned_maintenance", "sl3"],
            ],
            info: "План-график – ежемесячный с привязкой к декаде месяца. Нормативные сервисные часы – с 6:00 до 18:00, пн.-пт.",
          },
        ],
      }

      const group3: Group = {
        name: "% выполнения внеплановых заявок в соответствии с необходимым уровнем сервиса",
        weight: "0,25",
        rows: [
          {
            method:
              "Частное количества выполненных внеплановых заявок в соответствии с необходимым уровнем сервиса к количеству выполненных внеплановых заявок × 100",
            planned: ["100%", dash, dash],
            deviation: ["10%", dash, dash],
            actualPaths: [
              ["sla_percent", "customer_call", "sl1"],
              ["sla_percent", "customer_call", "sl2"],
              ["sla_percent", "customer_call", "sl3"],
            ],
          },
        ],
      }

      const group4: Group = {
        name: "% выполнения плановых заявок в соответствии с необходимым уровнем сервиса",
        weight: "0,25",
        rows: [
          {
            method:
              "Частное количества выполненных плановых заявок в соответствии с необходимым уровнем сервиса к количеству выполненных плановых заявок × 100",
            planned: ["100%", dash, dash],
            deviation: [dash, dash, dash],
            actualPaths: [
              ["sla_percent", "planned", "sl1"],
              ["sla_percent", "planned", "sl2"],
              ["sla_percent", "planned", "sl3"],
            ],
          },
        ],
      }

      const group5: Group = {
        name: "Общий процент выполнения SLA по всем типам тикетов",
        weight: "",
        rows: [
          {
            method: "Общий процент выполнения SLA по всем типам заявок",
            planned: [dash, dash, dash],
            deviation: [dash, dash, dash],
            actualPaths: [
              ["sla_percent", "overall", "sl1"],
              ["sla_percent", "overall", "sl2"],
              ["sla_percent", "overall", "sl3"],
            ],
          },
        ],
      }

      const groups = [group1, group2, group3, group4, group5]

      // Подготовим ширины колонок под основную таблицу
      ws.getColumn(1).width = 40 // A
      ws.getColumn(2).width = 50 // B
      for (let c = 3; c <= 11; c++) ws.getColumn(c).width = 12 // C..K
      ws.getColumn(12).width = 10 // L

      for (const g of groups) {
        const start = r
        g.rows.forEach((row, idx) => {
          if (idx === 0) ws.getCell(`A${r}`).value = g.name
          ws.getCell(`B${r}`).value = row.method

          // План
          ws.getCell(`C${r}`).value = row.planned[0]
          ws.getCell(`D${r}`).value = row.planned[1]
          ws.getCell(`E${r}`).value = row.planned[2]

          // Допуск
          ws.getCell(`F${r}`).value = row.deviation[0]
          ws.getCell(`G${r}`).value = row.deviation[1]
          ws.getCell(`H${r}`).value = row.deviation[2]

          // Факт (подставим только SL1 из данных, остальное «–»)
          const a1 = row.actualPaths[0].length
            ? pick(response, row.actualPaths[0])
            : "–"
          const a2 = row.actualPaths[1].length
            ? pick(response, row.actualPaths[1])
            : "–"
          const a3 = row.actualPaths[2].length
            ? pick(response, row.actualPaths[2])
            : "–"
          ws.getCell(`I${r}`).value = a1
          ws.getCell(`J${r}`).value = a2
          ws.getCell(`K${r}`).value = a3

          if (idx === 0) ws.getCell(`L${r}`).value = g.weight

          // Стили строки
          for (let c = 1; c <= 12; c++) {
            const cell = ws.getCell(r, c)
            cell.border = borderThin
            setWrap(cell, c !== 2 ? true : false) // метод расчета выравниваем по левому краю
          }

          r++

          // Строка info (если есть)
          if (row.info) {
            ws.mergeCells(`C${r}:K${r}`)
            ws.getCell(`C${r}`).value = row.info
            ws.getCell(`C${r}`).font = { size: 9, italic: true }
            setWrap(ws.getCell(`C${r}`), false)
            // границы на всю строку
            for (let c = 1; c <= 12; c++) ws.getCell(r, c).border = borderThin
            r++
          }
        })

        // Объединения по группе
        if (g.rows.length > 1) {
          ws.mergeCells(`A${start}:A${r - 1}`)
          ws.mergeCells(`L${start}:L${start + g.rows.length - 1}`)
        }

        // Пустая строка между группами
        r++
      }

      // Генерация файла
      const fileName = `Отчет_SLA_${dateFrom}_${dateTo}.xlsx`
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

      message.success("Отчет по SLA успешно выгружен")
    } catch (e) {
      console.error("Ошибка при выгрузке отчета SLA:", e)
      message.error("Ошибка при выгрузке отчета SLA")
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
    exportSlaReport,
    isDateRangeValid,
  }
}
