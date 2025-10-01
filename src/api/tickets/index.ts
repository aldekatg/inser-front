import { Response, SortedFieldsType } from "@/types.ts"
import { api, objectToUrlParams } from "@/api"
import { TicketsResponse } from "@/api/tickets/types.ts"

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
