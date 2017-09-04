FROM node:8.4

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN npm install

CMD ["node", "."]