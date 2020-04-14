FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk --no-cache add screen
RUN npm install

COPY . .
COPY ./.env .

CMD ["sh", "run.sh"]
