FROM node:8.4

COPY . /var/src/app

WORKDIR /var/src/app

RUN npm install typings --global
RUN typings install

RUN npm install

RUN npm run build

RUN chgrp -R 0 /var/src/app && chmod -R 777 /var/src/app

CMD ["node", "."]