FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk --no-cache add screen
RUN npm install

COPY . .
COPY ./.env .

CMD ["screen", "-d", "-m", "-S", "frisco-order", "sh", "run.sh"]
