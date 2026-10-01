FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Vite needs --host to be accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host"]
