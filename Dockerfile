FROM node:8.4

ENV SRC_DIR /var/src/app
ENV PATH "$SRC_DIR/node_modules/.bin:$PATH"

COPY . $SRC_DIR

WORKDIR $SRC_DIR

RUN npm install typings --global
RUN typings install

RUN npm install
RUN PATH=""

RUN npm run build

RUN chgrp -R 0 $SRC_DIR && chmod -R 777 $SRC_DIR

CMD ["node", "."]