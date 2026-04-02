# Weddly Notification Service (NestJS)

This is a standalone NestJS microservice for in-app notifications.

## Why this will not break your existing app

- It lives in a separate folder with its own package.json.
- It runs on its own port (default 3001).
- Existing Weddly app files only send HTTP events and can continue working even if this service is unavailable.
- Your current Next.js scripts keep working exactly as before.

## Features included

- Health check endpoint: GET /health
- Create notification: POST /notifications
- Ingest event from app: POST /notifications/events
- List user notifications: GET /notifications?userId=...&limit=...
- Unread count: GET /notifications/unread-count?userId=...
- Mark as read: PATCH /notifications/:id/read?userId=...

## Setup

1) Copy env template:

cp .env.example .env

2) Install deps:

npm install

3) Run in dev:

npm run start:dev

## Environment variables

- PORT: service port, default 3001
- MONGODB_URI: Mongo connection string
- SERVICE_TOKEN: shared secret for event ingestion
- CORS_ORIGIN: allowed frontend origin
- REDIS_HOST: Redis host for BullMQ
- REDIS_PORT: Redis port for BullMQ
- REDIS_PASSWORD: Redis password (optional)

## Example event request from Next.js

POST http://localhost:3001/notifications/events
Headers:
- Content-Type: application/json
- x-service-token: your SERVICE_TOKEN

Body:
{
  "eventType": "PROPOSAL_SUBMITTED",
  "userId": "USER_ID",
  "metadata": {
    "proposalId": "abc123"
  }
}

The events endpoint is queued (BullMQ) with retry and exponential backoff, so transient outages do not drop notifications immediately.

## Event types currently wired

- USER_REGISTERED
  - Triggered after successful registration.
- PROPOSAL_SUBMITTED
  - Triggered after successful proposal submit.
- CONTRACT_ACCEPTED
  - Triggered when a contract is accepted/activated.
- PAYMENT_SUCCESS
  - Triggered after successful payment callback/confirmation.

If you send any other eventType, a fallback notification is created with generic "New update" text.

## Suggested next step

Wire one existing Next.js route to emit events after successful actions, for example submit proposal or contract acceptance.

## Next.js env values

Add these to your main app env file:

NOTIFICATION_SERVICE_URL=http://localhost:3001
NOTIFICATION_SERVICE_TOKEN=replace-with-strong-secret
