FROM keymetrics/pm2:10-alpine

#Install git as required to install defra-logging-facade
RUN set -xe \
    && apk update && apk upgrade \
    && apk add bash make gcc g++ python curl git \
    && npm install -g npm \
    && git --version && bash --version && npm -v && node -v \
    && rm -rf /var/cache/apk/*

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

WORKDIR /home/node/app

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

USER node

COPY package*.json ./

COPY ./bin ./bin

COPY ./client ./client
COPY ./index.js .

RUN mkdir -p ./public/build/stylesheets

RUN npm install --production

COPY ./server ./server

COPY --chown=node:node . .

EXPOSE 3000

ENTRYPOINT [ "pm2-runtime", "index.js" ]