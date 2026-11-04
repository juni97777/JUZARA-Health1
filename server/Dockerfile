FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run db:generate && npm run build -w server
WORKDIR /app/server
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push && npm run db:seed && npm run start"]
