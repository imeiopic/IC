# ==========================================
# STAGE 1: Build the Frontend Substrate
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and environment variables
COPY . .

# Build the Vue application. Our custom Vite plugin will synthesize dist/nginx.conf
RUN npm run build

# ==========================================
# STAGE 2: Runtime Node (Nginx Frontend Only)
# ==========================================
FROM nginx:alpine
WORKDIR /app

# Copy the built Vue frontend to the Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Relocate the dynamically generated Nginx configuration and purge it from the public web root
COPY --from=builder /app/dist/nginx.conf /etc/nginx/conf.d/default.conf
RUN rm /usr/share/nginx/html/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
