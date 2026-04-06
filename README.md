This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Use Node.js 22 LTS for local development:

```bash
nvm install 22
nvm use 22
npm install
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Note: this project uses `next dev --webpack` for better development stability on macOS.
`npm run dev` is configured to run through Node 22 automatically.
If a dev server is already running, `npm run dev` reuses it and exits cleanly.
Use `npm run dev:restart` to stop the current dev server and start a fresh one.

`npm run dev` also applies safety limits by default to avoid system-wide freezes:
- Node heap cap: `DEV_MAX_OLD_SPACE_MB=2048`
- Next worker cap: `NEXT_BUILD_CPUS=3`

Tune them if needed:

```bash
DEV_MAX_OLD_SPACE_MB=2560 NEXT_BUILD_CPUS=2 npm run dev:restart
```

This workspace is intentionally configured for Webpack dev mode to avoid Turbopack-related system instability.

## Safe production build on macOS

To avoid high memory spikes on local machines, `npm run build` runs through a safe wrapper that caps Node heap size.

```bash
npm run build
```

If needed, adjust memory cap (in MB):

```bash
BUILD_MAX_OLD_SPACE_MB=4096 npm run build
```

If your machine gets hot or sluggish during build, cap build workers:

```bash
NEXT_BUILD_CPUS=4 npm run build
```

Use a pre-tuned stable mode (recommended for older Macs):

```bash
npm run build:stable
```

To run plain Next build directly:

```bash
npm run build:raw
```

## Project Report

A detailed project report is available in `PROJECT_REPORT.md`. It includes architecture diagrams, development methodology, a test plan, and appendices with sample code and analysis.
