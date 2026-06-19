FROM node:20.14.0-alpine3.20 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY gateway/package.json ./gateway/package.json
COPY services/auth/package.json ./services/auth/package.json
COPY services/user/package.json ./services/user/package.json
COPY services/retail/package.json ./services/retail/package.json
COPY services/para/package.json ./services/para/package.json
COPY services/alimentation/package.json ./services/alimentation/package.json
COPY services/fashion/package.json ./services/fashion/package.json
COPY services/mailer-api/package.json ./services/mailer-api/package.json
COPY services/engagement/package.json ./services/engagement/package.json
COPY services/web-control/package.json ./services/web-control/package.json
COPY shared/types/package.json ./shared/types/package.json
RUN npm ci --workspace @app/para

COPY services/para ./services/para
RUN npm run build --workspace @app/para

FROM node:20.14.0-alpine3.20
RUN apk add --no-cache wget
WORKDIR /app
COPY package.json package-lock.json ./
COPY gateway/package.json ./gateway/package.json
COPY services/auth/package.json ./services/auth/package.json
COPY services/user/package.json ./services/user/package.json
COPY services/retail/package.json ./services/retail/package.json
COPY services/para/package.json ./services/para/package.json
COPY services/alimentation/package.json ./services/alimentation/package.json
COPY services/fashion/package.json ./services/fashion/package.json
COPY services/mailer-api/package.json ./services/mailer-api/package.json
COPY services/engagement/package.json ./services/engagement/package.json
COPY services/web-control/package.json ./services/web-control/package.json
COPY shared/types/package.json ./shared/types/package.json
RUN npm ci --omit=dev --workspace @app/para
WORKDIR /app/services/para
COPY --from=builder /app/services/para/dist ./dist
COPY services/para/src/db/migrations ./dist/db/migrations
EXPOSE 3004
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/index.js"]
