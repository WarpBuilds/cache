FROM node:20-slim
WORKDIR /app

RUN corepack enable

COPY /package.json package.json
COPY /index.js index.js

CMD [ "node", "index.js" ]