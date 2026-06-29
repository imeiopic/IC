# ==========================================
# STAGE 1: Build the Frontend Substrate
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source code and environment variables
COPY . .

# Build the Vue application. Our custom Vite plugin will synthesize dist/nginx.conf
# We inject compression and security headers required for SharedArrayBuffer in Self.vue
RUN npm run build:app && \
    sed -i '/location \/ {/a \        gzip_static on;\n        brotli_static on;\n        add_header Cross-Origin-Opener-Policy "same-origin";\n        add_header Cross-Origin-Embedder-Policy "require-corp";' dist/browser/nginx.conf && \
    mv dist/browser/nginx.conf /app/nginx.conf

# ==========================================
# STAGE 2: Runtime Node (Nginx Frontend Only)
# ==========================================
# Use an image that includes the ngx_brotli module
FROM fholzer/nginx-brotli:alpine

# Copy the built Vue frontend to the Nginx web root
COPY --from=builder /app/dist/browser /usr/share/nginx/html

# Relocate the dynamically generated Nginx configuration
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
