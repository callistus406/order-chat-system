FROM node:latest AS base
WORKDIR /app

COPY package.json yarn.lock ./

ENV PATH /app/node_modules/.bin:$PATH

COPY . .
RUN  yarn prisma generate

ENV PORT=3000
EXPOSE $PORT

FROM base AS development
ENV NODE_ENV=development

CMD ["sh", "-c", "yarn prisma migrate deploy && yarn start:dev"]
