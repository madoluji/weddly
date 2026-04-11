# Admin Setup Guide

## Purpose
Use this guide to bootstrap and operate admin access safely in local and production environments.

## 1. Required Environment Variables
Set these values in your environment (or `.env` for local development):

- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `ACCCESS_TOKEN_SECRET_KEY`
- `SUPERADMIN_USERNAME`
- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD`
- `SUPERADMIN_FIRST_NAME` (optional)
- `SUPERADMIN_LAST_NAME` (optional)

For admin invitation emails (super-admin add-admin endpoint):

- `EMAIL_USER`
- `EMAIL_PASS`
- `NEXTAUTH_URL`

## 2. Bootstrap First Superadmin
Run:

```bash
npm run seed:superadmin
```

This upserts one admin document with role `superadmin` using:

- `SUPERADMIN_USERNAME`
- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD`

Script location: `scripts/seed-superadmin.ts`

## 3. Login Flow
1. Open `/admin/login`.
2. Sign in with `SUPERADMIN_USERNAME` and `SUPERADMIN_PASSWORD`.
3. You should be redirected to `/admin`.

## 4. Authorization Model
- Middleware protects:
  - `/admin/*` (except `/admin/login`) for admin sessions.
  - `/api/admin/*` for admin roles.
  - `/api/admin/super-admin/*` for `superadmin` only.
- Route-level defense-in-depth is also applied in admin API handlers.

## 5. Audit Logging
Admin mutations now write records to `AdminAudit` collection:

- actor identity (id/email/role)
- action and resource
- success/failed status
- optional metadata and client IP

## 6. Recommended Operational Steps
1. Rotate `SUPERADMIN_PASSWORD` after first bootstrap.
2. Rotate `ACCCESS_TOKEN_SECRET_KEY` and `NEXTAUTH_SECRET` on a schedule.
3. Restrict who can run `seed:superadmin` in production.
4. Review audit logs regularly for privilege-sensitive actions.

## 7. Quick Verification
Run:

```bash
npm run test:e2e -- e2e/admin-auth-guard.spec.ts
```

If role-token tests skip, ensure `ACCCESS_TOKEN_SECRET_KEY` is available in the test environment.
