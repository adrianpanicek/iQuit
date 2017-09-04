FROM node:8.4

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN npm install typings --global
RUN typings install

RUN npm install

RUN npm run build

CMD ["node", "."]