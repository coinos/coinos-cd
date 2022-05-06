FROM node:16.14.2-alpine
ARG NODE_ENV=production

RUN apk add bash
RUN apk add git
RUN apk add --update npm

COPY . /coinos-cd
WORKDIR /coinos-cd/app

RUN npm i
RUN node compile p
RUN touch .env
RUN mkdir letsencrypt