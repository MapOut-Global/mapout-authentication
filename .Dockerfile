FROM node:20.11.0-alpine

WORKDIR /home/node/app

COPY . .

ENV NPM_CONFIG_LOGLEVEL=warn
ENV CI=true

RUN npm ci


EXPOSE 9000

CMD ["npm","start"]
