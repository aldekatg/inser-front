import { Response, SortedFieldsType } from "@/types.ts"
import { api, objectToUrlParams } from "@/api"
import {
  MaterialResponse,
  TicketCreatePayload,
  TicketDetails,
  TicketsResponse,
  TicketUpdatePayload,
} from "@/api/tickets/types.ts"

const URLS = {
  getTickets: "/tickets",
  getMaterials: "/integrations/onec/warehouses/",
  confirmQR: "/tickets",
}

// Tickets
export const fetchTickets = async (sortedFields: SortedFieldsType) =>
  api
    .get<
      Response<TicketsResponse>
    >(URLS.getTickets + objectToUrlParams(sortedFields))
    .then((resp) => resp.data)

export const fetchTicketById = async (id: string | string[]) =>
  api
    .get<Response<TicketDetails>>(`${URLS.getTickets}/${id}`)
    .then((resp) => resp.data)

export const updateTicketById = async (id: number, body: TicketUpdatePayload) =>
  api
    .patch<Response<TicketDetails>>(`${URLS.getTickets}/${id}`, body)
    .then((resp) => resp.data)

export const createTicketReq = async (body: TicketCreatePayload) =>
  api
    .post<Response<TicketDetails>>(URLS.getTickets, body)
    .then((resp) => resp.data)

// 1C Integration
export const fetchMaterials = async (guid: string) =>
  api
    .get<
      Response<MaterialResponse[]>
    >(URLS.getMaterials + `${guid}/remaining-goods`)
    .then((resp) => resp.data)

// QR Code Confirmation
export const confirmQRCode = async (id: number, guid: string) =>
  api.post(`${URLS.confirmQR}/${id}/confirm-qr`, guid).then((resp) => resp.data)
