FROM node:lts AS dependencies
WORKDIR /asd
ENV MODE production
COPY package*.json ./
RUN npm install

FROM node:lts AS builder
WORKDIR /asd
ENV MODE production
COPY . .
COPY --from=dependencies /asd/node_modules ./node_modules
RUN npm run build

FROM node:lts AS runner
WORKDIR /asd
ENV MODE production
ENV NODE_ENV production

COPY --from=builder /asd/public ./public
COPY --from=builder /asd/package.json ./package.json
COPY --from=builder /asd/.next ./.next
COPY --from=builder /asd/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "run", "start"]