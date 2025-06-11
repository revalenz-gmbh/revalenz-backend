# Build Stage
FROM node:20-slim AS builder

# Arbeitsverzeichnis anlegen
WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Prisma Client generieren
RUN npx prisma generate

# Production Stage
FROM node:20-slim AS production

# Systempakete aktualisieren und OpenSSL 3.0.x installieren
RUN apt-get update && \
    apt-get install -y openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Nur notwendige Dateien aus dem Builder kopieren
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Anwendungsdateien kopieren
COPY . .

# Umgebungsvariablen setzen
ENV NODE_ENV=production
ENV PORT=8080
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

# Port freigeben
EXPOSE 8080

# Healthcheck hinzufügen
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Startbefehl
CMD ["node", "src/server.js"]