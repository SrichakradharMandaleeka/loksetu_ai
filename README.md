<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# LokSetu AI - Directory Structure & Quickstart

This application is organized into separated **frontend** and **backend** modules with unified workspace root orchestration.

## Directory Structure

```
loksetu-ai/
├── frontend/             # React + Vite UI Client
│   ├── src/              # React components, pages, styles, & types
│   ├── index.html        # HTML entry point
│   ├── vite.config.ts    # Vite configuration & backend proxy
│   ├── tsconfig.json     # Frontend TypeScript configuration
│   └── package.json      # Frontend dependencies & scripts
├── backend/              # Node.js + Express + Gemini AI Server
│   ├── src/              # Server source code & API routes
│   │   ├── server.ts     # Express server implementation
│   │   └── types.ts      # Backend data types
│   ├── tsconfig.json     # Backend TypeScript configuration
│   └── package.json      # Backend dependencies & scripts
├── package.json          # Root workspace configuration & scripts
└── README.md
```

## Running Locally

**Prerequisites:** Node.js (v18+)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables:**
   Set `GEMINI_API_KEY` in your environment or `.env` file.

3. **Run Application:**
   - **Combined (Frontend + Backend):**
     ```bash
     npm run dev
     ```
   - **Frontend Only:**
     ```bash
     npm run dev:frontend
     ```
   - **Backend Only:**
     ```bash
     npm run dev:backend
     ```

4. **Build and Start:**
   ```bash
   npm run build
   npm start
   ```
