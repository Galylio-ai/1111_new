# Backend (legacy — prefer root stack)

> **Full stack:** use the root Compose project **`1111`** from the repo root:
> `docker compose up -d --build` → web on `:3001`, API on `:3000`

# Backend

Microservices backend with an Express gateway, auth service, user service, Python mailer, PostgreSQL, and RabbitMQ.

## Environment Setup

Create a local environment file before running Docker Compose or the services:

```powershell
Copy-Item .env.example .env
```

Then replace the placeholder values in `.env`. Do not commit `.env`; it is intentionally gitignored because it contains secrets.

`JWT_SECRET` must be at least 32 characters. You can generate a strong value with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Google OAuth is optional. If `GOOGLE_CLIENT_ID` is empty, the auth service still starts and `/auth/google` returns `503` until Google OAuth is configured.

## Common Commands

Install dependencies:

```powershell
npm ci
```

Run all TypeScript builds:

```powershell
npm run build
```

Run tests:

```powershell
npm test
```

Start Docker services (backend only — prefer root `docker compose` for full stack):

```powershell
docker compose up -d
```

Run a service locally in watch mode:

```powershell
npm run dev:gateway
npm run dev:auth
npm run dev:user
```
