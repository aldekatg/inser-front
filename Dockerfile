FROM node:22-alpine AS build
# можно и node:20.19-alpine, если хочешь LTS 20

WORKDIR /app

# быстрее за счёт кеша
COPY package*.json ./
RUN npm ci

# исходники
COPY . .

# билд
RUN npm run build


# --- Stage 2: serve static ---
FROM nginx:alpine

# если нужна SPA-рутинг поддержка, раскомментируй и добавь свой конфиг
# COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

