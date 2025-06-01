# 1. Basis-Image (Node.js LTS)
FROM node:20

# Systempakete aktualisieren und nicht benötigte entfernen (ohne OpenSSL-Install)
RUN apt-get update && apt-get upgrade -y && apt-get autoremove -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Arbeitsverzeichnis anlegen
WORKDIR /app

# 3. package.json und package-lock.json kopieren
COPY package*.json ./

# 4. Abhängigkeiten installieren
RUN npm install

# 5. Prisma-Schema und Migrationen kopieren
COPY prisma ./prisma

# 6. Prisma Client generieren
RUN npx prisma generate

# 7. Restlichen Code kopieren
COPY . .

# 8. Port freigeben (z.B. 3000)
EXPOSE 3000

# 9. Startbefehl
CMD ["node", "src/server.js"]