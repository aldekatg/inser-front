const PROD_URL = import.meta.env.VITE_API_BASE
const PORT = import.meta.env.PORT
const FLEXIBLE_ADMISSION = import.meta.env.VITE_FLEXIBLE_ADMISSION

export const config = {
  BACKEND_URL: PROD_URL,
  PORT: PORT,
  FLEXIBLE_ADMISSION: FLEXIBLE_ADMISSION,
}
