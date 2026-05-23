# Project Architecture & Standards

## 1. Core Architecture
- **Type:** Monorepo (Frontend + Backend).
- **Tech Stack:** React (TypeScript), Vite, Tailwind CSS, Express (Node.js).
- **Pattern:** The application must mirror the structure and logic found in `https://github.com/mauricej-source/ai_unit_calculator`.

## 2. Deployment Protocol (CRITICAL)
- **Environment:** Render (Build on Render).
- **Docker:** DO NOT use Dockerfiles. 
- **Build Command:** `npm install && npm run build` (This must compile Vite assets into `dist/`).
- **Start Command:** `node server.mjs`
- **Routing:** `server.mjs` must be configured to serve static assets from the `client/dist` directory and include a catch-all route `app.get('*', ...)` to return `index.html` for SPA/React Router compatibility.

## 3. Data & Content
- **Approach:** Data-driven (No external Headless CMS).
- **Structure:** Store all site content (Portfolio items, 'About' copy, links) in `/data/content.json`.
- **API:** Express must expose a `GET /api/content` route to serve this JSON.

## 4. Commerce & Utilities
- **Commerce:** PayPal Checkout REST API integration. Handler logic must reside in `server.mjs`.
- **PDFs:** Utilize `jsPDF` and `html2canvas` for client-side generation.
- **Environment Variables:** Use `dotenv`. Always provide a `.env.example` file. Never hardcode API keys.

## 5. Coding Standards
- **Language:** TypeScript (Strict mode).
- **Styling:** Tailwind CSS (Minimalist aesthetic, mobile-responsive).
- **Structure:** 
  - `/client` (React/Vite source)
  - `/server` (Express entry and API handlers)
  - `/data` (Static content files)