# Base stage
FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# Dependencies stage
FROM base AS deps
RUN npm install

# Development stage
FROM base AS dev
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS prod
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 5000
CMD ["npm", "start"]
