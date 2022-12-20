FROM node:18.12.1-alpine3.16
WORKDIR /lockey
COPY package*.json .
COPY src ./src
RUN npm install
ENTRYPOINT npm start
