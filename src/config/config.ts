const NODE_ENV = import.meta.env.VITE_NODE_ENV
const PROD_URL = import.meta.env.VITE_BACKEND_PROD_URL
const DEV_URL = import.meta.env.VITE_BACKEND_DEV_URL
const PORT = import.meta.env.PORT
const BACKEND_BASE = NODE_ENV === "production" ? PROD_URL : DEV_URL
const FLEXIBLE_ADMISSION = import.meta.env.VITE_FLEXIBLE_ADMISSION

export const config = {
  BACKEND_URL: BACKEND_BASE,
  BACKEND_BASE_URL: BACKEND_BASE,
  PORT: PORT || 5137,
  FLEXIBLE_ADMISSION: FLEXIBLE_ADMISSION,
}
