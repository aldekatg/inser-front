import { Response, SortedFieldsType } from "@/types.ts"
import { api, objectToUrlParams } from "@/api"
import { TicketDetails, TicketsResponse } from "@/api/tickets/types.ts"

const URLS = {
  getTickets: "/tickets",
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
