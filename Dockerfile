FROM node:20

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./

RUN pnpm install

COPY . .

RUN pnpm run build

CMD [ "pnpm", "run", "start:dev" ]