FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Source code is mounted in docker-compose for dev
EXPOSE 3000

CMD ["npm", "run", "dev"]
