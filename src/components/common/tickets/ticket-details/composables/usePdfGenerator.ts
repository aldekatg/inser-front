import { PDFDocument, rgb } from "pdf-lib"
import { TicketDetails } from "@/api/tickets/types"
import fontkit from "@pdf-lib/fontkit"
import { TicketStatusDictionary } from "@/utils/types"

export function usePdfGenerator() {
  /**
   * Загружает локальные шрифты с поддержкой кириллицы
   */
  async function loadCyrillicFont(pdfDoc: PDFDocument) {
    // Регистрируем fontkit для работы с кастомными шрифтами
    pdfDoc.registerFontkit(fontkit)

    // Используем локальные шрифты DejaVu Sans
    const fontUrl = "/fonts/DejaVuSans.ttf"
    const fontUrlBold = "/fonts/DejaVuSans-Bold.ttf"

    try {
      const [regularResponse, boldResponse] = await Promise.all([
        fetch(fontUrl),
        fetch(fontUrlBold),
      ])

      if (!regularResponse.ok || !boldResponse.ok) {
        throw new Error("Не удалось загрузить шрифты")
      }

      const [regularFontBytes, boldFontBytes] = await Promise.all([
        regularResponse.arrayBuffer(),
        boldResponse.arrayBuffer(),
      ])

      const font = await pdfDoc.embedFont(regularFontBytes)
      const fontBold = await pdfDoc.embedFont(boldFontBytes)

      return { font, fontBold }
    } catch (error) {
      console.error("Ошибка загрузки шрифта:", error)
      throw new Error("Не удалось загрузить шрифт для генерации PDF")
    }
  }

  /**
   * Форматирует дату в формат ДД.ММ.ГГГГ ЧЧ:ММ
   */
  function formatDateTime(dateValue: string | Date | null | undefined): string {
    if (!dateValue) return "Не указано"

    try {
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return "Не указано"

      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")

      return `${day}.${month}.${year} ${hours}:${minutes}`
    } catch {
      return "Не указано"
    }
  }

  /**
   * Получает текстовое значение критичности
   */
  function getCriticalityText(criticality: string | null | undefined): string {
    if (!criticality) return "Не указано"

    return (
      TicketStatusDictionary.TicketCriticality[
        criticality as keyof typeof TicketStatusDictionary.TicketCriticality
      ] || criticality
    )
  }

  /**
   * Получает текстовое значение статуса
   */
  function getStatusText(status: string | null | undefined): string {
    if (!status) return "Не указано"

    return (
      TicketStatusDictionary.StatusType[
        status as keyof typeof TicketStatusDictionary.StatusType
      ] || status
    )
  }

  /**
   * Получает текстовое значение типа заявки
   */
  function getTicketTypeText(ticketType: string | null | undefined): string {
    if (!ticketType) return "Не указано"

    return (
      TicketStatusDictionary.TicketSource[
        ticketType as keyof typeof TicketStatusDictionary.TicketSource
      ] || ticketType
    )
  }

  /**
   * Разбивает длинный текст на строки по максимальной длине
   */
  function wrapText(text: string, maxLength: number): string[] {
    if (!text) return [""]

    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = ""

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (testLine.length <= maxLength) {
        currentLine = testLine
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    }

    if (currentLine) lines.push(currentLine)
    return lines
  }

  /**
   * Рисует чекбокс в PDF
   */
  function drawCheckbox(
    page: any,
    x: number,
    y: number,
    checked: boolean,
    size: number = 12
  ) {
    // Рисуем квадрат
    page.drawRectangle({
      x,
      y,
      width: size,
      height: size,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    })

    // Если отмечен, рисуем галочку линиями
    if (checked) {
      const checkSize = size * 0.6
      const startX = x + size * 0.2
      const startY = y + size * 0.4

      // Рисуем галочку двумя линиями
      page.drawLine({
        start: { x: startX, y: startY },
        end: { x: startX + checkSize * 0.4, y: startY - checkSize * 0.5 },
        thickness: 1.5,
        color: rgb(0, 0.5, 0),
      })

      page.drawLine({
        start: { x: startX + checkSize * 0.4, y: startY - checkSize * 0.5 },
        end: { x: startX + checkSize, y: startY + checkSize * 0.5 },
        thickness: 1.5,
        color: rgb(0, 0.5, 0),
      })
    }
  }

  /**
   * Генерирует PDF документ на основе данных заявки
   */
  async function generatePDF(ticket: TicketDetails) {
    // Создаем новый PDF документ
    const pdfDoc = await PDFDocument.create()

    // Добавляем страницу
    let page = pdfDoc.addPage([595.28, 841.89]) // A4 размер
    const { width, height } = page.getSize()

    // Загружаем шрифты с поддержкой кириллицы
    const { font, fontBold } = await loadCyrillicFont(pdfDoc)

    const margin = 50
    let yPosition = height - margin

    // Заголовок организации
    const companyName = "Общество с ограниченной ответственностью «ИНСЕР»"
    const companyNameWidth = fontBold.widthOfTextAtSize(companyName, 11)
    page.drawText(companyName, {
      x: (width - companyNameWidth) / 2,
      y: yPosition,
      size: 11,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    yPosition -= 30

    // Заголовок документа
    const serviceSheetNumber = ticket.service_sheet_number || "б/н"
    const title = `Сервисный лист ${serviceSheetNumber}`
    const titleWidth = fontBold.widthOfTextAtSize(title, 14)
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y: yPosition,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    // Горизонтальная линия
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    })
    yPosition -= 20

    // Информация о заявке
    // Номер заявки
    page.drawText(`№ ${ticket.ticket_number}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })

    const locationText = `${ticket.gas_station?.region?.name || "Не указано"} - ${ticket.gas_station?.company?.name || "Не указано"}`
    page.drawText(locationText, {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    // Описание заявки
    page.drawText("Описание заявки:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })

    const contentLines = wrapText(ticket.content || "Не указано", 65)
    for (const line of contentLines) {
      page.drawText(line, {
        x: margin + 200,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      yPosition -= 12
    }
    yPosition -= 13

    // Критичность
    page.drawText("Критичность:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    page.drawText(getCriticalityText(ticket.criticality), {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    // Статус заявки
    page.drawText("Статус:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    page.drawText(getStatusText(ticket.status), {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    // Тип заявки
    page.drawText("Тип заявки:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    page.drawText(getTicketTypeText(ticket.ticket_type), {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    // Дата/время заявки
    page.drawText("Дата/время заявки:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    page.drawText(formatDateTime(ticket.submitted_at), {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    // Техническая услуга
    const techServiceText =
      ticket.technical_tasks_details
        ?.map((task) => task.description)
        .join(" ") || "Не указано"

    page.drawText("Сервисная услуга (ТЗ): ", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    yPosition -= 2

    const wrappedTechService = wrapText(techServiceText, 50)
    for (const line of wrappedTechService) {
      page.drawText(line, {
        x: margin + 200,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      yPosition -= 12
    }
    yPosition -= 25

    // ФИО исполнителя
    page.drawText("ФИО исполнителя:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    page.drawText(ticket.employee?.full_name || "Не указано", {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    // Дата/время начала работ
    page.drawText("Дата/время начала работ:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    page.drawText(formatDateTime(ticket.created_at), {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    // Дата/время окончания работ
    page.drawText("Дата/время окончания работ:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    page.drawText(formatDateTime(ticket.closed_at), {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    // Результат диагностики
    page.drawText("Результат диагностики:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    page.drawText(ticket.diagnostic_result || "Не указано", {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    // Оборудование - собираем из всех технических заданий
    const equipmentList =
      ticket.technical_tasks_details
        ?.map((task) => task.equipment)
        .filter(Boolean)
        .join(", ") || "Не указано"

    page.drawText("Оборудование:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    yPosition -= 2

    const wrappedEquipment = wrapText(equipmentList, 65)
    for (const line of wrappedEquipment) {
      page.drawText(line, {
        x: margin + 200,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      yPosition -= 12
    }
    yPosition -= 13

    // Перечень работ
    page.drawText("Перечень работ:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    page.drawText(ticket.work_result || "Не указано", {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    // Использованные материалы
    const materialsText = Array.isArray(ticket.materials)
      ? ticket.materials
          .map((m: any) => `${m.nomenclature_name} (${m.quantity} шт.)`)
          .join(", ")
      : "Не указано"

    page.drawText("Использованные материалы:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })

    const wrappedMaterials = wrapText(materialsText, 65)
    for (const line of wrappedMaterials) {
      page.drawText(line, {
        x: margin + 200,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      yPosition -= 12
    }
    yPosition -= 25

    // Представитель заказчика
    page.drawText("Представитель заказчика:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    page.drawText(ticket.gas_station?.operator_name || "Не указано", {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    // Дата / время подписи
    page.drawText("Дата / время:", {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    page.drawText(formatDateTime(new Date()), {
      x: margin + 200,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 30

    // Горизонтальная линия
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    })
    yPosition -= 20

    // Чек-листы
    if (
      ticket.technical_tasks_details &&
      ticket.technical_tasks_details.length > 0
    ) {
      page.drawText("Чек-листы", {
        x: margin,
        y: yPosition,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      })
      yPosition -= 30

      for (const task of ticket.technical_tasks_details) {
        if (task.checklists && task.checklists.length === 0) continue
        if (yPosition < 80) {
          // Добавляем новую страницу, если место закончилось
          page = pdfDoc.addPage([595.28, 841.89])
          yPosition = height - margin
        }

        // Название технического задания (серый фон)
        const taskNameText = `${task.code}: ${task.description}`
        // Уменьшаем максимальную длину строки, чтобы текст помещался в серый фон
        const wrappedTaskName = wrapText(taskNameText, 75)

        // Рассчитываем высоту серого фона в зависимости от количества строк
        const lineHeight = 12
        const padding = 10
        const rectHeight = wrappedTaskName.length * lineHeight + padding

        // Рисуем серый фон
        page.drawRectangle({
          x: margin,
          y: yPosition - rectHeight + lineHeight - 2,
          width: width - 2 * margin,
          height: rectHeight,
          color: rgb(0.9, 0.9, 0.9),
        })

        // Рисуем текст построчно
        let textY = yPosition - padding / 2 + 2
        for (const line of wrappedTaskName) {
          page.drawText(line, {
            x: margin + 5,
            y: textY,
            size: 10,
            font: fontBold,
            color: rgb(0, 0, 0),
          })
          textY -= lineHeight
        }

        yPosition -= rectHeight + 5

        // Чеклисты для этого задания
        if (task.checklists && task.checklists.length > 0) {
          for (const checklist of task.checklists) {
            // Заголовок чек-листа
            page.drawText(checklist.description, {
              x: margin,
              y: yPosition,
              size: 10,
              font: fontBold,
              color: rgb(0, 0, 0),
            })
            yPosition -= 25

            // Элементы чек-листа
            if (checklist.items && checklist.items.length > 0) {
              for (const item of checklist.items) {
                if (yPosition < 60) {
                  page = pdfDoc.addPage([595.28, 841.89])
                  yPosition = height - margin
                }

                drawCheckbox(page, margin, yPosition, item.done || false, 12)

                const checklistText = item.description
                const wrappedChecklist = wrapText(checklistText, 70)

                for (let i = 0; i < wrappedChecklist.length; i++) {
                  page.drawText(wrappedChecklist[i], {
                    x: margin + 20,
                    y: yPosition,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0),
                  })
                  if (i < wrappedChecklist.length - 1) {
                    yPosition -= 12
                  }
                }

                yPosition -= 25
              }
            }

            yPosition -= 5
          }
        }

        yPosition -= 10
      }
    }

    // Сохраняем PDF
    const pdfBytes = await pdfDoc.save()

    // Создаем blob и скачиваем
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
      type: "application/pdf",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${ticket.service_sheet_number || ticket.ticket_number}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    generatePDF,
  }
}
