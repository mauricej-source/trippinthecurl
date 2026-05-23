import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const apiPort = Number(process.env.PORT ?? process.env.API_PORT ?? 5177);
const apiHost = process.env.PORT ? "0.0.0.0" : (process.env.API_HOST ?? "127.0.0.1");
const webPort = Number(process.env.WEB_PORT ?? 5176);
const dataFile = path.join(__dirname, "data", "content.json");
const distDir = path.join(__dirname, "client", "dist");
const portfolioImagesDir = path.join(__dirname, "client", "public", "images", "portfolio");
const portfolioDescriptionsDir = path.join(__dirname, "client", "public", "images", "portfolio_descriptions");
const paypalMode = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";
const paypalBaseUrl = paypalMode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me-admin";
const authSecret = process.env.AUTH_SECRET ?? "local-dev-auth-secret-change-before-production";

app.set("trust proxy", true);
app.use(express.json({ limit: "128kb" }));

async function readContent() {
  const raw = await fs.readFile(dataFile, "utf8");
  return normalizeContentPaths(JSON.parse(raw));
}

async function writeContent(content) {
  const validated = validateContent(normalizeContentPaths(content));
  await fs.writeFile(dataFile, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  return validated;
}

function normalizeContentPaths(content) {
  if (!content || typeof content !== "object") {
    return content;
  }

  const normalizeImagePath = (image) => {
    if (image === "/images/portfolio/OceanicDelight.jpg") {
      return "/images/portfolio/Oceanic Delight.jpg";
    }
    return image;
  };

  return {
    ...content,
    portfolio: Array.isArray(content.portfolio)
      ? content.portfolio.map((item) => ({ ...item, image: normalizeImagePath(item.image) }))
      : content.portfolio,
    projects: Array.isArray(content.projects)
      ? content.projects.map((item) => ({ ...item, image: normalizeImagePath(item.image) }))
      : content.projects,
  };
}

function titleFromFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function scanPortfolioItems(existingItems = []) {
  const files = await fs.readdir(portfolioImagesDir);
  const imageFiles = files
    .filter((file) => /\.(avif|gif|jpe?g|png|webp)$/i.test(file))
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
  const existingByImage = new Map(existingItems.map((item) => [item.image, item]));
  const existingByTitle = new Map(existingItems.map((item) => [item.title, item]));

  const items = await Promise.all(imageFiles.map(async (file) => {
    const base = file.replace(/\.[^.]+$/, "");
    const image = `/images/portfolio/${file}`;
    const title = titleFromFilename(file);
    const existing = existingByImage.get(image) ?? existingByTitle.get(title);
    const descriptionPath = path.join(portfolioDescriptionsDir, `${base}.txt`);
    const description = await pathExists(descriptionPath)
      ? (await fs.readFile(descriptionPath, "utf8")).trim()
      : "";

    return {
      title: existing?.title ?? title,
      medium: existing?.medium ?? "Original artwork",
      image,
      description: description || existing?.description || "Original artwork from the TrippinTheCurl collection.",
      price: Number(existing?.price ?? 0),
      available: Boolean(existing?.available),
    };
  }));

  return items;
}

async function syncPortfolioDescriptions(content) {
  if (!Array.isArray(content.portfolio)) {
    return;
  }

  await fs.mkdir(portfolioDescriptionsDir, { recursive: true });

  await Promise.all(content.portfolio.map(async (item) => {
    if (!item.image || typeof item.description !== "string") {
      return;
    }

    const imageFilename = path.basename(decodeURIComponent(item.image));
    const descriptionFilename = imageFilename.replace(/\.[^.]+$/, ".txt");

    if (!descriptionFilename || descriptionFilename === imageFilename) {
      return;
    }

    await fs.writeFile(path.join(portfolioDescriptionsDir, descriptionFilename), item.description.trim(), "utf8");
  }));
}

function validateContent(content) {
  if (!content || typeof content !== "object") {
    throw new Error("Content payload must be an object.");
  }
  if (!Array.isArray(content.portfolio)) {
    throw new Error("Content payload must include a portfolio array.");
  }
  if (!Array.isArray(content.commerce?.items)) {
    throw new Error("Content payload must include commerce.items.");
  }
  for (const item of content.portfolio) {
    if (!item.title || !item.image) {
      throw new Error("Every portfolio item must include title and image.");
    }
    if (item.price !== undefined && (!Number.isFinite(Number(item.price)) || Number(item.price) < 0)) {
      throw new Error(`Invalid price for portfolio item: ${item.title}`);
    }
  }
  for (const item of content.commerce.items) {
    if (!item.id || !item.label) {
      throw new Error("Every commerce item must include id and label.");
    }
    if (!Number.isFinite(Number(item.amount)) || Number(item.amount) < 0) {
      throw new Error(`Invalid amount for commerce item: ${item.label}`);
    }
  }
  return content;
}

function readCookie(request, name) {
  const raw = request.headers.cookie ?? "";
  const pair = raw.split(";").map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : "";
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", authSecret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verify(token) {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = crypto.createHmac("sha256", authSecret).update(body).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (!payload.exp || payload.exp < Date.now()) return null;
  return payload;
}

function requireAdmin(request, response, next) {
  const payload = verify(readCookie(request, "admin_session"));
  if (!payload?.admin) {
    response.status(401).json({ error: "Admin sign-on required." });
    return;
  }
  next();
}

function hasPayPalCredentials() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function getPayPalAccessToken() {
  if (!hasPayPalCredentials()) {
    return null;
  }

  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error_description ?? "PayPal authentication failed.");
  }

  return body.access_token;
}

function devMockPaymentsEnabled() {
  return process.env.ENABLE_DEV_MOCK_PAYMENTS !== "false" && paypalMode !== "live";
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "trippinthecurl" });
});

app.get("/api/content", async (_request, response, next) => {
  try {
    response.json(await readContent());
  } catch (error) {
    next(error);
  }
});

app.get("/api/paypal/config", (_request, response) => {
  response.json({
    clientId: process.env.PAYPAL_CLIENT_ID ?? null,
    mode: paypalMode,
    serverVerified: hasPayPalCredentials(),
    devMockPayments: devMockPaymentsEnabled(),
  });
});

app.post("/api/admin/login", (request, response) => {
  const password = String(request.body?.password ?? "");
  if (password !== adminPassword) {
    response.status(401).json({ error: "Invalid admin password." });
    return;
  }
  const token = sign({ admin: true, exp: Date.now() + 1000 * 60 * 60 * 8 });
  response.setHeader("Set-Cookie", `admin_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`);
  response.json({ ok: true });
});

app.post("/api/admin/logout", (_request, response) => {
  response.setHeader("Set-Cookie", "admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  response.json({ ok: true });
});

app.get("/api/admin/session", (request, response) => {
  response.json({ authenticated: Boolean(verify(readCookie(request, "admin_session"))?.admin) });
});

app.get("/api/admin/content", requireAdmin, async (_request, response, next) => {
  try {
    response.json(await readContent());
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/content", requireAdmin, async (request, response, next) => {
  try {
    const saved = await writeContent(request.body);
    await syncPortfolioDescriptions(saved);
    response.json(saved);
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/portfolio/refresh", requireAdmin, async (_request, response, next) => {
  try {
    const content = await readContent();
    const portfolio = await scanPortfolioItems(content.portfolio);
    response.json(await writeContent({ ...content, portfolio }));
  } catch (error) {
    next(error);
  }
});

app.post("/api/paypal/create-order", async (request, response, next) => {
  try {
    const requestedAmount = Number(request.body?.amount ?? 0);
    let amount = requestedAmount;
    let label = String(request.body?.label ?? "TrippinTheCurl payment");
    const artworkImage = String(request.body?.artworkImage ?? "");

    if (artworkImage) {
      const content = await readContent();
      const artwork = content.portfolio.find((item) => item.image === artworkImage);

      if (!artwork || !artwork.available || !Number.isFinite(Number(artwork.price)) || Number(artwork.price) <= 0) {
        response.status(400).json({ error: "Artwork is not available for sale." });
        return;
      }

      amount = Number(artwork.price);
      label = `Artwork: ${artwork.title}`;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      response.status(400).json({ error: "A positive payment amount is required." });
      return;
    }

    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      if (!devMockPaymentsEnabled()) {
        response.status(503).json({ error: "PayPal credentials are not configured." });
        return;
      }
      response.json({ id: `mock-${crypto.randomUUID()}`, status: "CREATED", label });
      return;
    }

    const paypalResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: label,
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });

    const body = await paypalResponse.json().catch(() => ({}));
    response.status(paypalResponse.status).json(body);
  } catch (error) {
    next(error);
  }
});

app.post("/api/paypal/capture-order", async (request, response, next) => {
  try {
    const orderId = String(request.body?.orderId ?? "");
    if (!orderId) {
      response.status(400).json({ error: "A PayPal orderId is required." });
      return;
    }

    const accessToken = await getPayPalAccessToken();
    if (!accessToken || orderId.startsWith("mock-")) {
      if (!devMockPaymentsEnabled()) {
        response.status(503).json({ error: "PayPal credentials are not configured." });
        return;
      }
      response.json({ id: orderId, status: "COMPLETED", mock: true });
      return;
    }

    const paypalResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const body = await paypalResponse.json().catch(() => ({}));
    response.status(paypalResponse.status).json(body);
  } catch (error) {
    next(error);
  }
});

app.use(express.static(distDir));

app.use(async (_request, response) => {
  try {
    await fs.access(path.join(distDir, "index.html"));
    response.sendFile(path.join(distDir, "index.html"));
  } catch {
    response.status(404).send(`Build the frontend with npm run build, or use Vite on http://127.0.0.1:${webPort}/.`);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: error instanceof Error ? error.message : "Unexpected server error." });
});

app.listen(apiPort, apiHost, () => {
  console.log(`TrippinTheCurl server listening on http://${apiHost}:${apiPort}`);
});
