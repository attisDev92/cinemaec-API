# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build la aplicación
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar build desde builder
COPY --from=builder /app/dist ./dist

# Establecer variable de ambiente para producción
ENV NODE_ENV=production

# Exponer puerto 8080 (requerido por Cloud Run)
EXPOSE 8080

# Health check con timeout extendido para permitir migraciones
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Comando de inicio
CMD ["node", "dist/main"]
