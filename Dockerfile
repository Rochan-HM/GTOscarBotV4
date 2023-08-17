FROM node:18-alpine

WORKDIR /app

ARG DATABASE_URL=${DATABASE_URL}
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json .

COPY . .

RUN apk update \
    && apk add openssl \
    && npm install \
    && npm cache clean --force \
    && npm run build

CMD ["npm", "start"]
