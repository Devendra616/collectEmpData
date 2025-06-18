# client/Dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
COPY .env .env
RUN npm install
COPY . .
RUN npm run build


# Serve the static files PRODUCTION
FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/dist .
EXPOSE 5173
CMD ["serve", "-s", ".","-l","5173"]
#CMD ["npm","run","dev"]
