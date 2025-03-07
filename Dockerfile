# Verwende ein Node.js-Image
FROM node:18

# Setze das Arbeitsverzeichnis
WORKDIR /app

# Kopiere package.json und installiere Abhängigkeiten
COPY package*.json ./
RUN npm install

# Kopiere den Rest der Anwendung
COPY . .

# Exponiere den gewünschten Port (5000)
EXPOSE 5000

# Starte den Node.js-Server
CMD ["npm", "run", "dev"]
# CMD ["npm", "start"]