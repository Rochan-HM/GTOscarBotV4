FROM node:18-alpine

WORKDIR /app

ARG DATABASE_URL=${DATABASE_URL}
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json .

COPY . .

RUN npx --yes prisma migrate deploy && npm install --production && npm cache clean --force

CMD ["npm", "start"]
