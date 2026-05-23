# trippinthecurl

Dedicated to my personal website. One that will present professional and personal accomplishments over the course of my life.

## Stack

- React, TypeScript, Vite, Tailwind CSS
- Node.js and Express
- Data-driven content in `data/content.json`
- Client-side PDF export with jsPDF and html2canvas
- PayPal Checkout REST API endpoints in `server.mjs`

## Local Development

Install dependencies:

```bash
npm install
npm install --prefix client
```

Run the Express API and Vite dev server:

```bash
npm run dev
```

The app runs at `http://127.0.0.1:5176/`.
The API runs at `http://127.0.0.1:5177/`.

## Production Build

```bash
npm run build
npm start
```

The production server serves the compiled frontend from `client/dist` and exposes `GET /api/content`.

## Render

Use Render's standard Node build environment.

- Build command: `npm install && npm run build`
- Start command: `node server.mjs`
