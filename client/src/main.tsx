import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Home,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Palette,
  Plus,
  Save,
  Settings,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import "./styles.css";

type NavItem = { label: string; path: string };
type LinkItem = { label: string; url: string };
type ImageItem = {
  title: string;
  image: string;
  medium?: string;
  description?: string;
  price?: number;
  available?: boolean;
  commissioned?: boolean;
  sold?: boolean;
  gift?: boolean;
  sequence?: number;
};
type Content = {
  site: { title: string; tagline: string; location: string; hours: string; email: string; phone: string };
  navigation: NavItem[];
  socialLinks: LinkItem[];
  home: { eyebrow: string; headline: string; intro: string; heroImage?: string; featuredWorks: ImageItem[] };
  contact: { title: string; copy: string; address: string };
  about: { title: string; portrait: string; paragraphs: string[] };
  resume: {
    name: string;
    title: string;
    summary: string[];
    highlights: string[];
    skills: string[];
    education: string[];
    certifications: string[];
  };
  portfolio: ImageItem[];
  publications: {
    title: string;
    subtitle: string;
    author: string;
    series: string;
    releaseStatus?: string;
    image: string;
    description: string[];
    links: LinkItem[];
    reviews?: { quote: string; author: string }[];
    pressRelease?: { headline: string; subhead: string; dateline: string; paragraphs: string[] };
    contactCallout?: { title: string; copy: string; email: string };
    reviewCopyUrl?: string;
  }[];
  domains: { title: string; image: string; description: string; features: string[]; note?: string }[];
  projects: { title: string; image: string; description: string; specs: string }[];
  commerce: { items: { id: string; label: string; description: string; amount: number }[] };
};

type PayPalConfig = {
  clientId: string | null;
  mode: "sandbox" | "live";
  serverVerified: boolean;
  devMockPayments: boolean;
};
type AdminOrder = {
  id: string;
  paypalOrderId: string;
  paypalCaptureId: string;
  status: string;
  mode: "sandbox" | "live";
  mock?: boolean;
  createdAt: string;
  updatedAt: string;
  artworkTitle: string;
  artworkImage: string;
  amount: number;
  currency: string;
  payerName: string;
  payerEmail: string;
  shippingName: string;
  shippingAddress?: {
    name: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    lines: string[];
  } | null;
};

const routeTitles: Record<string, string> = {
  "/": "Home",
  "/hireme": "Hire Me",
  "/contact": "Contact Me",
  "/about": "About the Artist",
  "/portfolio": "Portfolio",
  "/publications": "Publications",
  "/domains": "Domains",
  "/new-projects": "New Projects",
  "/admin": "Administration",
};

const SITE_URL = "https://trippinthecurl.com";
const INDEX_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const NOINDEX_ROBOTS = "noindex, nofollow, noarchive";
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/images/backgroundimages/Oceanic%20Delight.jpg`;

type RouteMeta = {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  image?: string;
};

const routeMetadata: Record<string, RouteMeta> = {
  "/": {
    title: "TrippinTheCurl | Artwork, Publications, and Projects by Maurice C. Johnson III",
    description: "Explore TrippinTheCurl, the artwork, publications, professional profile, software domains, and creative projects of Maurice C. Johnson III.",
    canonical: `${SITE_URL}/`,
    robots: INDEX_ROBOTS,
    image: DEFAULT_SOCIAL_IMAGE,
  },
  "/hireme": {
    title: "Senior Solutions Engineer | Maurice C. Johnson III",
    description: "Review Maurice C. Johnson III's professional profile, resume, technical skills, certifications, and senior solutions engineering experience.",
    canonical: `${SITE_URL}/hireme`,
    robots: INDEX_ROBOTS,
  },
  "/contact": {
    title: "Contact TrippinTheCurl | Maurice C. Johnson III",
    description: "Contact Maurice C. Johnson III for artwork, publications, interviews, review copies, professional inquiries, and TrippinTheCurl questions.",
    canonical: `${SITE_URL}/contact`,
    robots: INDEX_ROBOTS,
  },
  "/about": {
    title: "About the Artist | Maurice C. Johnson III",
    description: "Learn about Maurice C. Johnson III, the artist behind TrippinTheCurl, his creative influences, artistic mission, and website vision.",
    canonical: `${SITE_URL}/about`,
    robots: INDEX_ROBOTS,
  },
  "/portfolio": {
    title: "Original Artwork Portfolio | TrippinTheCurl",
    description: "Browse the TrippinTheCurl original artwork portfolio by Maurice C. Johnson III, including paintings, drawings, sculptures, and mixed-media works.",
    canonical: `${SITE_URL}/portfolio`,
    robots: INDEX_ROBOTS,
  },
  "/publications": {
    title: "A Fractured I.T. by Maurice C. Johnson III | TrippinTheCurl",
    description: "Read about A Fractured I.T., a cautionary book on artificial intelligence, automation, careers, and the human cost of innovation.",
    canonical: `${SITE_URL}/publications`,
    robots: INDEX_ROBOTS,
    image: `${SITE_URL}/images/bookcovers/Fractured_JaneEyre_Audience_Cropped.png`,
  },
  "/domains": {
    title: "Software Domains and AI Projects | TrippinTheCurl",
    description: "Explore software domains and AI-assisted projects by Maurice C. Johnson III, including AI UNIT Calculator and related product ideas.",
    canonical: `${SITE_URL}/domains`,
    robots: INDEX_ROBOTS,
  },
  "/new-projects": {
    title: "New Artwork Projects | TrippinTheCurl",
    description: "View current TrippinTheCurl works in progress, including Oceanic Delight, 420 at the Watertower, and other developing artwork projects.",
    canonical: `${SITE_URL}/new-projects`,
    robots: INDEX_ROBOTS,
  },
  "/admin": {
    title: "Administration | TrippinTheCurl",
    description: "Private administration area for TrippinTheCurl portfolio, artwork sales, content, and PayPal configuration.",
    canonical: `${SITE_URL}/admin`,
    robots: NOINDEX_ROBOTS,
  },
};

function metadataForPath(path: string): RouteMeta {
  return (
    routeMetadata[path] ?? {
      title: "Page Not Found | TrippinTheCurl",
      description: "The requested TrippinTheCurl page could not be found.",
      canonical: `${SITE_URL}${path}`,
      robots: NOINDEX_ROBOTS,
    }
  );
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }
  return body as T;
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function safeFilename(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "receipt";
}

function receiptText(order: AdminOrder) {
  const shippingLines = order.shippingAddress?.lines?.length
    ? [order.shippingName || order.shippingAddress.name, ...order.shippingAddress.lines].filter(Boolean)
    : ["No shipping address returned by PayPal for this order."];

  return [
    "TRIPPINTHECURL RECEIPT",
    "",
    "Seller",
    "TrippinTheCurl",
    "Maurice C. Johnson III",
    "Jacksonville, Florida, USA",
    "",
    "Order",
    `Receipt Date: ${new Date().toLocaleString()}`,
    `Order Date: ${new Date(order.createdAt).toLocaleString()}`,
    `PayPal Order ID: ${order.paypalOrderId}`,
    `PayPal Capture ID: ${order.paypalCaptureId || "Pending"}`,
    `Status: ${order.status}`,
    `Mode: ${order.mode}${order.mock ? " (Mock)" : ""}`,
    "",
    "Buyer",
    `Name: ${order.payerName || "Not returned"}`,
    `Email: ${order.payerEmail || "Not returned"}`,
    "",
    "Artwork",
    `Title: ${order.artworkTitle || "Artwork order"}`,
    `Image: ${order.artworkImage || "Not recorded"}`,
    "",
    "Payment",
    `Amount: ${formatCurrency(Number(order.amount ?? 0))}`,
    `Currency: ${order.currency || "USD"}`,
    "",
    "Shipping",
    ...shippingLines,
    "",
    "Thank you for your purchase from TrippinTheCurl.",
  ].join("\n");
}

function downloadReceipt(order: AdminOrder) {
  const blob = new Blob([receiptText(order)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFilename(order.artworkTitle || order.paypalOrderId)}-${safeFilename(order.paypalOrderId)}-receipt.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function cleanArtworkText(value: string) {
  return value.replace(/\r/g, "").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
}

function artworkSectionValue(description: string, label: string) {
  const match = description.match(new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n\\s*\\n[A-Z][A-Za-z ]{1,28}:|\\n\\s*\\nPrints|\\n\\s*\\nOR|$)`, "i"));
  return match ? cleanArtworkText(match[1]) : "";
}

function artworkDescriptionBody(description: string) {
  return description
    .replace(/\r/g, "")
    .replace(/Material:\s*[\s\S]*?(?=\n\s*\n[A-Z][A-Za-z ]{1,28}:|\n\s*\nPrints|\n\s*\nOR|$)/i, "")
    .replace(/Dimensions:\s*[\s\S]*?(?=\n\s*\n[A-Z][A-Za-z ]{1,28}:|\n\s*\nPrints|\n\s*\nOR|$)/i, "")
    .replace(/Prints are Available[\s\S]*/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function artworkDetail(item: ImageItem) {
  const description = item.description ?? "";
  return {
    body: artworkDescriptionBody(description) || "Original artwork from the TrippinTheCurl collection.",
    material: artworkSectionValue(description, "Material") || item.medium || "Original artwork",
    dimensions: artworkSectionValue(description, "Dimensions"),
  };
}

function portfolioSequence(item: ImageItem, fallback: number) {
  const sequence = Number(item.sequence);
  return Number.isFinite(sequence) ? sequence : fallback + 1;
}

function sortPortfolioItems(items: ImageItem[]) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const sequenceDifference = portfolioSequence(left.item, left.index) - portfolioSequence(right.item, right.index);
      if (sequenceDifference !== 0) return sequenceDifference;
      return left.index - right.index;
    })
    .map(({ item }) => item);
}

function artworkDisplayTitle(item: ImageItem) {
  return `${item.title}${item.commissioned ? " - Commissioned" : ""}${item.sold ? " - SOLD" : ""}${item.gift ? " - Gift" : ""}`;
}

function App() {
  const [content, setContent] = useState<Content | null>(null);
  const [paypalConfig, setPayPalConfig] = useState<PayPalConfig | null>(null);
  const [path, setPath] = useState(window.location.pathname);
  const [loadError, setLoadError] = useState("");
  const routeMeta = metadataForPath(path);

  useDocumentMeta(routeMeta);

  useEffect(() => {
    Promise.all([fetchJson<Content>("/api/content"), fetchJson<PayPalConfig>("/api/paypal/config")])
      .then(([nextContent, nextConfig]) => {
        setContent(nextContent);
        setPayPalConfig(nextConfig);
        setLoadError("");
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Content could not be loaded."));
  }, []);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(nextPath: string) {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loadError) {
    return <ShellStatus message={loadError} />;
  }

  if (!content || !paypalConfig) {
    return <ShellStatus message="Loading TrippinTheCurl..." loading />;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <NavBar navigation={content.navigation} currentPath={path} onNavigate={navigate} />
      <main style={path === "/hireme" || path === "/about" || path === "/domains" || path === "/new-projects" ? { background: "linear-gradient(135deg, #11374c, #467f9f, #88bfde, #b7f2fe)" } : undefined}>
        {path === "/" ? <HomePage content={content} onNavigate={navigate} /> : null}
        {path === "/hireme" ? <HireMePage content={content} /> : null}
        {path === "/contact" ? <ContactPage content={content} /> : null}
        {path === "/about" ? <AboutPage content={content} /> : null}
        {path === "/portfolio" ? <PortfolioPage content={content} paypalConfig={paypalConfig} onContentUpdated={setContent} /> : null}
        {path === "/publications" ? <PublicationsPage content={content} /> : null}
        {path === "/domains" ? <DomainsPage content={content} /> : null}
        {path === "/new-projects" ? <ProjectsPage content={content} /> : null}
        {path === "/admin" ? <AdminPage currentContent={content} paypalConfig={paypalConfig} onContentSaved={setContent} onNavigate={navigate} /> : null}
        {!routeTitles[path] ? <NotFoundPage onNavigate={navigate} /> : null}
      </main>
      <SiteFooter content={content} />
    </div>
  );
}

function useDocumentMeta(meta: RouteMeta) {
  useEffect(() => {
    document.title = meta.title;
    setMeta("description", meta.description);
    setMeta("robots", meta.robots);
    setMeta("twitter:title", meta.title);
    setMeta("twitter:description", meta.description);
    setMeta("twitter:image", meta.image ?? DEFAULT_SOCIAL_IMAGE);
    setProperty("og:title", meta.title);
    setProperty("og:description", meta.description);
    setProperty("og:url", meta.canonical);
    setProperty("og:image", meta.image ?? DEFAULT_SOCIAL_IMAGE);
    setCanonical(meta.canonical);
  }, [meta]);
}

function setMeta(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function setProperty(property: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function setCanonical(href: string) {
  let tag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = "canonical";
    document.head.appendChild(tag);
  }
  tag.href = href;
}

function ShellStatus({ message, loading = false }: { message: string; loading?: boolean }) {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
      <div className="max-w-md border border-ink/10 bg-gallery p-6 text-center shadow-fine">
        {loading ? (
          <div className="trippin-spinner mx-auto mb-5" aria-hidden="true">
            <span />
            <span />
            <span />
            <i />
          </div>
        ) : null}
        <p className="font-serif text-2xl">{message}</p>
      </div>
    </div>
  );
}

function NavBar({ navigation, currentPath, onNavigate }: { navigation: NavItem[]; currentPath: string; onNavigate: (path: string) => void }) {
  const [open, setOpen] = useState(false);

  function handleClick(path: string) {
    setOpen(false);
    onNavigate(path);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#a7d4cb]/20 bg-[#052434] backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
        <button
          className="min-w-0 text-[clamp(1rem,5vw,1.25rem)] font-semibold uppercase tracking-[0.06em] text-[#a7d4cb] sm:tracking-[0.08em]"
          style={{ fontFamily: "'Stardos Stencil', Stencil, 'Arial Black', Impact, sans-serif" }}
          onClick={() => handleClick("/")}
          aria-label="Home"
          type="button"
        >
          TRIPPINTHECURL
        </button>
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <button
            className="grid size-9 place-items-center border border-[#a7d4cb]/30 text-[#a7d4cb]"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            type="button"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            className={`grid size-9 place-items-center border border-[#a7d4cb]/30 text-[#a7d4cb] ${
              currentPath === "/admin" ? "border-white text-white" : ""
            }`}
            onClick={() => handleClick("/admin")}
            title="Admin"
            aria-label="Admin"
            type="button"
          >
            <Settings size={16} />
          </button>
        </div>
        <div className="hidden items-center gap-5 md:flex">
          {navigation.map((item) => (
            <button
              className={`text-xs font-semibold uppercase tracking-[0.18em] transition hover:text-clay ${
                currentPath === item.path ? "text-white" : "text-[#a7d4cb]"
              }`}
              key={item.path}
              onClick={() => handleClick(item.path)}
              type="button"
            >
              {item.label}
            </button>
          ))}
          <button
            className={`grid size-9 place-items-center border border-[#a7d4cb]/25 text-[#a7d4cb] transition hover:border-white hover:text-white ${
              currentPath === "/admin" ? "border-white text-white" : ""
            }`}
            onClick={() => handleClick("/admin")}
            title="Admin"
            aria-label="Admin"
            type="button"
          >
            <Settings size={16} />
          </button>
        </div>
      </nav>
      {open ? (
        <div className="border-t border-[#a7d4cb]/20 bg-[#052434] px-4 py-3 md:hidden">
          <div className="grid gap-1">
            {navigation.map((item) => (
              <button
                className={`px-2 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] ${
                  currentPath === item.path ? "text-white" : "text-[#a7d4cb]"
                }`}
                key={item.path}
                onClick={() => handleClick(item.path)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function PageFrame({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  const isHireMe = eyebrow === "Professional profile";
  const isGradientPage = isHireMe || eyebrow === "Artist statement" || eyebrow === "Built domains" || eyebrow === "Works in progress";
  const isWidePage = eyebrow === "Original works";
  const usesStencilHeader = isGradientPage || isWidePage;

  return (
    <section className={`mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16 ${isWidePage ? "max-w-[1600px]" : "max-w-7xl"}`}>
      <div className="mb-8 max-w-3xl">
        {isWidePage ? (
          <h1
            className="font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl"
            style={{ fontFamily: "'Stardos Stencil', Stencil, 'Arial Black', Impact, sans-serif" }}
          >
            {title} <span className="align-baseline text-xs font-bold uppercase tracking-[0.24em] text-[#052434]">{eyebrow}</span>
          </h1>
        ) : (
          <>
            <p
              className={`mb-3 text-xs font-bold uppercase tracking-[0.24em] ${isGradientPage ? "text-[#a7d4cb]" : "text-clay"}`}
              style={usesStencilHeader ? { fontFamily: "'Stardos Stencil', Stencil, 'Arial Black', Impact, sans-serif" } : undefined}
            >
              {eyebrow}
            </p>
            <h1
              className={isGradientPage ? "text-[38px] font-normal leading-tight text-[#a7d4cb]" : "font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl"}
              style={usesStencilHeader ? { fontFamily: "'Stardos Stencil', Stencil, 'Arial Black', Impact, sans-serif" } : undefined}
            >
              {title}
            </h1>
          </>
        )}
      </div>
      {children}
    </section>
  );
}

function HomePage({ content, onNavigate }: { content: Content; onNavigate: (path: string) => void }) {
  const featuredPublication = content.publications[0];

  return (
    <>
      <section className="relative min-h-[72vh] overflow-hidden bg-[#052434] sm:min-h-[calc(100vh-74px)]">
        {content.home.heroImage ? (
          <img className="absolute inset-0 size-full object-cover object-center sm:object-cover" src={content.home.heroImage} alt="TrippinTheCurl wave" />
        ) : null}
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl items-start justify-center px-4 pt-8 text-center sm:min-h-[calc(100vh-74px)] sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
          <div>
            <h1 className="font-serif text-2xl font-bold uppercase italic leading-none tracking-[0.02em] text-white sm:text-4xl lg:text-5xl">
              {content.home.headline}
            </h1>
            <p className="mt-2 font-serif text-base font-bold uppercase italic tracking-[0.04em] text-white sm:text-xl lg:text-2xl">
              {content.home.eyebrow}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#bef1fe]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {content.home.featuredWorks.map((work) => (
            <button className="home-art-card" key={work.title} onClick={() => onNavigate("/portfolio")} type="button">
              <h2>{work.title}</h2>
              <img src={work.image} alt={work.title} />
            </button>
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-[#bef1fe]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <h2 className="font-serif text-2xl font-bold uppercase italic leading-tight text-ink">
              {content.site.tagline}
            </h2>
            <p className="mt-3 max-w-2xl font-serif text-xl italic leading-8 text-graphite">{content.home.intro}</p>
            <button className="mt-10 min-h-14 rounded-full bg-[#63949d] px-14 text-lg font-bold text-white transition hover:bg-[#052434]" onClick={() => onNavigate("/publications")} type="button">
              Learn More
            </button>
          </div>
          {featuredPublication ? (
            <button className="block text-left" onClick={() => onNavigate("/publications")} type="button">
              <img className="max-h-[520px] w-full object-cover" src="/images/bookcovers/Fractured_JaneEyre_Audience.png" alt={featuredPublication.title} />
            </button>
          ) : null}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-[#333a48]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-white sm:px-6 lg:grid-cols-[1fr_0.7fr] lg:px-8">
          <div>
            <h2 className="font-serif text-3xl font-semibold">Contact Us</h2>
            <p className="mt-4 max-w-3xl leading-8 text-white/90">{content.contact.copy}</p>
          </div>
          <div className="lg:pt-[52px]">
            <ContactCard content={content} showTitle={false} />
          </div>
        </div>
      </section>
    </>
  );
}

function HireMePage({ content }: { content: Content }) {
  return (
    <PageFrame eyebrow="Professional profile" title="Hire Me">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="bg-gallery p-6 shadow-fine sm:p-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-[#052434] pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-[#052434]">{content.resume.name}</h2>
              <p className="mt-2 text-lg text-graphite">{content.resume.title}</p>
              <p className="mt-3 text-sm text-graphite">{content.site.email} | {content.site.phone} | {content.site.location}</p>
            </div>
            <a className="inline-flex min-h-11 w-fit items-center justify-center gap-2 bg-[#63949d] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#052434]" href="/documents/20260511_Maurice_Johnson_Resume.pdf" rel="noreferrer" target="_blank">
              <FileText size={17} />
              RESUME
            </a>
          </div>
          <ResumeSection title="Summary">
            {content.resume.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </ResumeSection>
          <ResumeSection title="Experience Highlights">
            <ul className="grid gap-2">
              {content.resume.highlights.map((item) => {
                const [role, company, ...dateParts] = item.split(", ");
                const date = dateParts.join(", ");
                return (
                  <li className="grid gap-1 sm:grid-cols-[1fr_170px] sm:gap-6" key={item}>
                    <span>{role}, {company}</span>
                    <span className="text-left sm:text-right">{date}</span>
                  </li>
                );
              })}
            </ul>
          </ResumeSection>
          <ResumeSection title="Technical Skills">
            <div className="flex flex-wrap gap-2">
              {content.resume.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}
            </div>
          </ResumeSection>
          <div className="grid gap-6 md:grid-cols-2">
            <ResumeSection title="Education">
              <ul className="grid gap-2">
                {content.resume.education.map((item) => {
                  const [degree, school] = item.split(" | ");
                  return (
                    <li key={item}>
                      <strong>{degree}</strong>
                      {school ? ` | ${school}` : null}
                    </li>
                  );
                })}
              </ul>
            </ResumeSection>
            <ResumeSection title="Certifications">
              <ul className="grid gap-2">
                {content.resume.certifications.map((item) => (
                  <li key={item}>
                    {item === "USF | AI Workflow Automation" ? (
                      <a className="text-[#052434] underline-offset-4 hover:underline" href="/documents/20260508_USF_AI_Workflow_Automation_Certificate.pdf" rel="noreferrer" target="_blank">{item}</a>
                    ) : item === "AI Mastery Program | Coursiv" ? (
                      <a className="text-[#052434] underline-offset-4 hover:underline" href="/documents/20260331_AI_Mastery_Program.pdf" rel="noreferrer" target="_blank">{item}</a>
                    ) : item === "PCEP - Associate Python Programmer" ? (
                      <a className="text-[#052434] underline-offset-4 hover:underline" href="/documents/20251119_Python_Associate.pdf" rel="noreferrer" target="_blank">{item}</a>
                    ) : item}
                  </li>
                ))}
              </ul>
            </ResumeSection>
          </div>
        </section>
        <aside className="grid content-start gap-5">
          <img className="w-full object-cover shadow-fine" src="/images/latest_selfie.jpg" alt="Maurice Johnson" />
          <ContactCard content={content} />
        </aside>
      </div>
    </PageFrame>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7 grid gap-3">
      <h3 className="text-[16px] font-bold uppercase tracking-[0.2em] text-[#052434]">{title}</h3>
      <div className="grid gap-3 leading-7 text-graphite">{children}</div>
    </section>
  );
}

function ContactPage({ content }: { content: Content }) {
  return (
    <PageFrame eyebrow="Contact" title={content.contact.title}>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <p className="max-w-3xl font-serif text-2xl leading-10 text-graphite">{content.contact.copy}</p>
        <ContactCard content={content} />
      </div>
    </PageFrame>
  );
}

function ContactCard({ content, showTitle = true }: { content: Content; showTitle?: boolean }) {
  return (
    <aside className="bg-gallery p-5 shadow-fine">
      {showTitle ? <h2 className="mb-4 font-serif text-2xl font-semibold">Contact</h2> : null}
      <div className="grid gap-3 text-sm leading-6 text-graphite">
        <a className="inline-flex items-center gap-2 hover:text-clay" href={`mailto:${content.site.email}`}>
          <Mail size={16} />
          {content.site.email}
        </a>
        <p>{content.contact.address}</p>
        <p>{content.site.hours}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {content.socialLinks.map((link) => (
          <a className="social-link" href={link.url} key={link.label} rel="noreferrer" target="_blank">
            {link.label}
          </a>
        ))}
      </div>
    </aside>
  );
}

function AboutPage({ content }: { content: Content }) {
  return (
    <PageFrame eyebrow="Artist statement" title={content.about.title}>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-3 bg-gallery p-6 leading-7 text-graphite shadow-fine sm:p-8">
          {content.about.paragraphs.map((paragraph, index) => (
            <p
              className={index === 0 ? "text-[20px] italic" : paragraph === "A Brief Note:" ? "font-bold" : ""}
              key={paragraph}
              style={index === 0 ? { fontFamily: "'Stardos Stencil', Stencil, 'Arial Black', Impact, sans-serif" } : undefined}
            >
              {paragraph}
            </p>
          ))}
        </section>
        <aside className="grid content-start gap-5">
          <img className="w-full object-cover shadow-fine" src={content.about.portrait} alt="Maurice Johnson" />
          <ContactCard content={content} />
        </aside>
      </div>
    </PageFrame>
  );
}

type PayPalCaptureResult = {
  status: string;
  mock?: boolean;
  artworkSold?: boolean;
  artwork?: { title: string; image: string } | null;
  order?: AdminOrder;
};

function PortfolioPage({ content, paypalConfig, onContentUpdated }: { content: Content; paypalConfig: PayPalConfig; onContentUpdated: (content: Content) => void }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [capturedReturnOrder, setCapturedReturnOrder] = useState("");
  const sortedPortfolio = useMemo(() => sortPortfolioItems(content.portfolio), [content.portfolio]);
  const selected = selectedIndex === null ? null : sortedPortfolio[selectedIndex];
  const selectedDetail = selected ? artworkDetail(selected) : null;
  const selectedIsForSale = Boolean(selected?.available && Number(selected.price ?? 0) > 0);

  function openArtwork(index: number) {
    setSelectedIndex(index);
    setZoom(1);
    setPaymentStatus("");
  }

  function closeArtwork() {
    setSelectedIndex(null);
    setZoom(1);
    setPaymentStatus("");
  }

  function showArtwork(offset: number) {
    setSelectedIndex((current) => {
      if (current === null) return current;
      setZoom(1);
      setPaymentStatus("");
      return (current + offset + sortedPortfolio.length) % sortedPortfolio.length;
    });
  }

  async function buyArtwork(item: ImageItem) {
    setIsPaying(true);
    setPaymentStatus("");
    try {
      const returnUrl = `${window.location.origin}/portfolio?paypalOrder=approved`;
      const cancelUrl = `${window.location.origin}/portfolio?paypalOrder=cancelled`;
      const order = await fetchJson<{ id: string; status: string; links?: { href: string; rel: string }[] }>("/api/paypal/create-order", {
        method: "POST",
        body: JSON.stringify({ amount: Number(item.price ?? 0), artworkImage: item.image, label: `Artwork: ${item.title}`, returnUrl, cancelUrl }),
      });
      const approvalLink = order.links?.find((link) => link.rel === "approve")?.href;
      if (approvalLink) {
        window.location.assign(approvalLink);
        return;
      }
      const capture = await fetchJson<PayPalCaptureResult>("/api/paypal/capture-order", {
        method: "POST",
        body: JSON.stringify({ orderId: order.id }),
      });
      setPaymentStatus(capture.artworkSold ? "Artwork payment completed. Artwork has been marked SOLD." : capture.mock ? "Mock artwork payment completed locally." : `Artwork payment ${capture.status.toLowerCase()}.`);
      if (capture.artworkSold) {
        onContentUpdated(await fetchJson<Content>("/api/content"));
      }
    } catch (error) {
      setPaymentStatus(error instanceof Error ? error.message : "Artwork payment failed.");
    } finally {
      setIsPaying(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paypalOrder = params.get("paypalOrder");
    const token = params.get("token");

    if (paypalOrder === "cancelled") {
      setPaymentStatus("PayPal checkout was cancelled.");
      window.history.replaceState({}, "", "/portfolio");
      return;
    }

    if (paypalOrder !== "approved" || !token || capturedReturnOrder === token) {
      return;
    }

    setCapturedReturnOrder(token);
    setIsPaying(true);
    setPaymentStatus("Completing PayPal payment...");
    fetchJson<PayPalCaptureResult>("/api/paypal/capture-order", {
      method: "POST",
      body: JSON.stringify({ orderId: token }),
    })
      .then(async (capture) => {
        setPaymentStatus(capture.artworkSold ? "Artwork payment completed. Artwork has been marked SOLD." : capture.mock ? "Mock artwork payment completed locally." : `Artwork payment ${capture.status.toLowerCase()}.`);
        if (capture.artworkSold) {
          onContentUpdated(await fetchJson<Content>("/api/content"));
        }
        window.history.replaceState({}, "", "/portfolio");
      })
      .catch((error) => {
        setPaymentStatus(error instanceof Error ? error.message : "Artwork payment failed.");
      })
      .finally(() => setIsPaying(false));
  }, [capturedReturnOrder, onContentUpdated]);

  useEffect(() => {
    if (selectedIndex === null) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeArtwork();
      if (event.key === "ArrowLeft") showArtwork(-1);
      if (event.key === "ArrowRight") showArtwork(1);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, sortedPortfolio.length]);

  return (
    <PageFrame eyebrow="Original works" title="Portfolio">
      {paymentStatus ? <p className="mb-6 border border-[#052434]/15 bg-[#bef1fe] p-3 text-sm font-semibold text-[#052434]">{paymentStatus}</p> : null}
      <section className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {sortedPortfolio.map((item, index) => (
          <button className="mb-4 block w-full break-inside-avoid bg-gallery text-left shadow-fine transition hover:-translate-y-0.5 hover:shadow-lg" key={item.image} onClick={() => openArtwork(index)} type="button">
            <img className="h-auto w-full object-contain" src={item.image} alt={item.title} />
            <span className="block bg-[#4687a8] px-3 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#bef1fe]">{artworkDisplayTitle(item)}</span>
          </button>
        ))}
      </section>

      {selected && selectedDetail ? (
        <div className="fixed inset-0 z-50 bg-white text-ink">
          <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
            <button className="grid size-10 place-items-center bg-white text-[#052434] shadow-fine transition hover:bg-[#bef1fe]" onClick={() => setZoom((value) => Math.max(0.5, Number((value - 0.25).toFixed(2))))} type="button" aria-label="Zoom out">
              <ZoomOut size={20} />
            </button>
            <button className="grid size-10 place-items-center bg-white text-[#052434] shadow-fine transition hover:bg-[#bef1fe]" onClick={() => setZoom((value) => Math.min(2.5, Number((value + 0.25).toFixed(2))))} type="button" aria-label="Zoom in">
              <ZoomIn size={20} />
            </button>
            <button className="grid size-10 place-items-center bg-white text-[#052434] shadow-fine transition hover:bg-[#bef1fe]" onClick={closeArtwork} type="button" aria-label="Close portfolio viewer">
              <X size={24} />
            </button>
          </div>

          <button className="absolute left-4 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center bg-white/80 text-[#052434] shadow-fine transition hover:bg-[#bef1fe]" onClick={() => showArtwork(-1)} type="button" aria-label="Previous artwork">
            <ChevronLeft size={28} />
          </button>
          <button className="absolute right-4 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center bg-white/80 text-[#052434] shadow-fine transition hover:bg-[#bef1fe]" onClick={() => showArtwork(1)} type="button" aria-label="Next artwork">
            <ChevronRight size={28} />
          </button>

          <div className="h-full overflow-y-auto px-5 py-16 sm:px-8 lg:px-16">
            <article className="mx-auto max-w-[1600px]">
              <header className="mb-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#052434]">{selectedDetail.material}</p>
                  <h2 className="mt-2 font-serif text-2xl font-semibold leading-none text-[#052434] sm:text-3xl">{artworkDisplayTitle(selected)}</h2>
                  {selectedIsForSale && paypalConfig.mode === "sandbox" ? (
                    <p className="mt-3 text-sm leading-6 text-graphite">
                      PayPal mode: {paypalConfig.mode}. {paypalConfig.serverVerified ? "Secure checkout uses configured PayPal credentials." : "Local mock checkout is enabled until PayPal credentials are configured."}
                    </p>
                  ) : null}
                </div>
                {selectedIsForSale ? (
                  <div className="grid gap-3 sm:grid-cols-[auto_auto] sm:items-center lg:justify-end">
                    <div className="sm:text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#052434]">Available for sale</p>
                      <p className="mt-1 font-serif text-4xl font-semibold leading-none text-[#052434]">{formatCurrency(Number(selected.price ?? 0))}</p>
                    </div>
                    <button className="inline-flex min-h-14 items-center justify-center gap-3 bg-[#63949d] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#052434]" disabled={isPaying} onClick={() => buyArtwork(selected)} type="button">
                      <ShoppingBag size={20} />
                      {isPaying ? "Starting" : "Buy Now"}
                    </button>
                  </div>
                ) : null}
              </header>

              {paymentStatus ? <p className="mb-4 border border-[#052434]/15 bg-[#bef1fe] p-3 text-sm font-semibold text-[#052434]">{paymentStatus}</p> : null}

              <div className="artwork-detail-flow text-graphite">
                <img
                  className="artwork-detail-image transition-transform duration-200"
                  src={selected.image}
                  alt={selected.title}
                  style={{ transform: `scale(${zoom})` }}
                />
                <p className="whitespace-pre-line leading-7">{selectedDetail.body}</p>
                <p className="clear-both pt-7 leading-7">
                  <strong>Material:</strong> {selectedDetail.material}
                  {selectedDetail.dimensions ? <> | <strong>Dimensions:</strong> {selectedDetail.dimensions}</> : null}
                  {" | "}
                  <strong>Artwork:</strong> {(selectedIndex ?? 0) + 1} of {sortedPortfolio.length}
                </p>
              </div>
            </article>
          </div>
        </div>
      ) : null}
    </PageFrame>
  );
}

function PublicationsPage({ content }: { content: Content }) {
  return (
    <section className="bg-paper text-ink">
      {content.publications.map((book) => (
        <article key={book.title}>
          <section className="bg-[#bef1fe]">
            <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-6 sm:px-6 lg:grid-cols-[1.2fr_0.9fr] lg:px-8 lg:py-7">
              <div className="order-2 lg:order-1">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-black">{book.releaseStatus ?? "Now available"}</p>
                <div className="mt-3 grid gap-1.5 text-ink">
                  <p className="text-[22px] leading-[24.5px]" style={{ fontFamily: "'Stardos Stencil', Stencil, 'Arial Black', Impact, sans-serif" }}><strong>Title:</strong> {book.title}</p>
                  <p className="text-[18px] leading-snug lg:whitespace-nowrap" style={{ fontFamily: "'Stardos Stencil', Stencil, 'Arial Black', Impact, sans-serif" }}><strong>Subtitle:</strong> {book.subtitle}</p>
                  <p className="text-[18px] leading-snug" style={{ fontFamily: "'Stardos Stencil', Stencil, 'Arial Black', Impact, sans-serif" }}><strong>Series:</strong> {book.series}</p>
                  <p className="pt-3 text-[18px] leading-snug" style={{ fontFamily: "'Stardos Stencil', Stencil, 'Arial Black', Impact, sans-serif" }}><strong>Author:</strong> {book.author}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {book.links.map((link) => (
                    <a className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#63949d] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#052434]" href={link.url} key={link.label} rel="noreferrer" target="_blank">
                      <BookOpen size={17} />
                      Buy on Amazon
                      <ExternalLink size={15} />
                    </a>
                  ))}
                  <a className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#63949d] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#052434]" href={book.reviewCopyUrl ?? `mailto:${book.contactCallout?.email ?? content.site.email}`} rel="noreferrer" target="_blank">
                    <FileText size={17} />
                    Review Copy
                  </a>
                </div>
                <div className="mt-4 grid gap-4 font-serif text-[16px] leading-7 text-ink">
                  {book.description.map((paragraph, index) => (
                    <p className={index === book.description.length - 1 ? "font-bold" : ""} key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <img className="mx-auto h-auto max-h-[610px] w-full max-w-[590px] object-cover" src={book.image} alt={book.title} />
              </div>
            </div>
          </section>

          {book.reviews?.length ? (
            <section className="bg-[#052434] text-paper">
              <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
                <h2 className="mb-8 text-center text-2xl font-bold uppercase" style={{ fontFamily: "'Stardos Stencil', Stencil, 'Arial Black', Impact, sans-serif" }}>Amazon Book Reviews</h2>
                <div className="grid gap-8 bg-white p-8 text-ink lg:grid-cols-3 lg:p-12">
                  {[book.reviews.slice(0, 1), book.reviews.slice(1, 3), book.reviews.slice(3)].map((column, columnIndex) => (
                    <div className="grid content-start gap-8" key={`review-column-${columnIndex}`}>
                      {column.map((review) => (
                        <figure key={review.author}>
                          <blockquote className="whitespace-pre-line font-serif text-[16px] leading-[28px] text-graphite">"{review.quote}"</blockquote>
                          <figcaption className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-black">- {review.author}</figcaption>
                        </figure>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {book.pressRelease ? (
            <section className="bg-[#bef1fe]">
              <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 p-8 lg:grid-cols-[0.65fr_1fr] lg:p-12">
                  <div>
                    <div className="flex items-center gap-3">
                      <img className="h-8 w-auto bg-transparent" src="/images/pressrelease/brightkey.png" alt="BrightKey" />
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-black">Official BrightKey Press Release</p>
                    </div>
                    <h2 className="mt-2 text-2xl font-normal leading-tight" style={{ fontFamily: "'Stardos Stencil', Stencil, 'Arial Black', Impact, sans-serif" }}>{book.pressRelease.headline}</h2>
                    <p className="mt-4 text-lg font-semibold leading-8 text-graphite">{book.pressRelease.subhead}</p>
                    <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-graphite">{book.pressRelease.dateline}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-5">
                      <img className="h-8 w-auto bg-transparent" src="/images/pressrelease/nbc.png" alt="NBC" />
                      <img className="h-8 w-auto bg-transparent" src="/images/pressrelease/cbs.png" alt="CBS" />
                      <img className="h-8 w-auto bg-transparent" src="/images/pressrelease/associatepress.png" alt="Associated Press" />
                      <img className="h-8 w-auto bg-transparent" src="/images/pressrelease/Google.png" alt="Google" />
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {book.pressRelease.paragraphs.map((paragraph) => (
                      <p className="font-serif text-[16px] leading-[28px] text-graphite" key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {book.contactCallout ? (
            <section className="bg-[#333a48] text-paper">
              <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid items-start gap-8 px-8 lg:grid-cols-[1fr_560px] lg:px-12">
                  <div>
                    <h2 className="font-serif text-3xl font-semibold">{book.contactCallout.title}</h2>
                    <p className="mt-2 leading-7 text-paper/75">{book.contactCallout.copy}</p>
                  </div>
                  <ContactCard content={content} showTitle={false} />
                </div>
              </div>
            </section>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function DomainsPage({ content }: { content: Content }) {
  return (
    <PageFrame eyebrow="Built domains" title="Domains">
      <section className="bg-gallery p-6 shadow-fine sm:p-8">
        <p className="mb-8 max-w-4xl leading-7 text-graphite">
          Each Domain started as an idea, a creation based upon what was observed as an industry need. They were brought to fruition by accelerating the Software Development Lifecycle (SDLC) through the use of OpenAI CodeX, a little patience, a little love, and a whole lot of imagination. Without further ado.
        </p>
        <div className="grid gap-6">
          {content.domains.map((domain) => (
            <article className="grid gap-6 border-t border-[#052434] pt-6 lg:grid-cols-[320px_1fr]" key={domain.title}>
              <img className="h-full min-h-60 w-full bg-paper object-contain shadow-fine" src={domain.image} alt={domain.title} />
              <div>
                <h2 className="font-serif text-3xl font-semibold text-[#052434]">
                  <a className="underline-offset-4 hover:underline" href="https://aiunitcalculator.com/" rel="noreferrer" target="_blank">{domain.title}</a>
                </h2>
                <p className="mt-3 whitespace-pre-line leading-7 text-graphite">{domain.description}</p>
                <ul className="mt-5 grid list-disc gap-2 pl-6 text-graphite">
                  {domain.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                {domain.note ? <p className="mt-5 leading-7 text-graphite">{domain.note}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

function ProjectsPage({ content }: { content: Content }) {
  return (
    <PageFrame eyebrow="Works in progress" title="New Projects">
      <section className="bg-gallery p-6 shadow-fine sm:p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {content.projects.map((project) => (
            <article key={project.title}>
              <h2 className="mb-4 font-serif text-3xl font-semibold text-[#052434]">{project.title}</h2>
              <div className="border-t border-[#052434] pt-6">
              <img className="h-[400px] w-full object-cover shadow-fine" src={project.image} alt={project.title} />
              <div className="grid gap-3 pt-5">
                <p className="leading-7 text-graphite">{project.description}</p>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#052434]">{project.specs}</p>
              </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

function AdminPage({
  currentContent,
  paypalConfig,
  onContentSaved,
  onNavigate,
}: {
  currentContent: Content;
  paypalConfig: PayPalConfig;
  onContentSaved: (content: Content) => void;
  onNavigate: (path: string) => void;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState(currentContent);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshingPortfolio, setRefreshingPortfolio] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [refreshingOrders, setRefreshingOrders] = useState(false);

  useEffect(() => {
    fetchJson<{ authenticated: boolean }>("/api/admin/session")
      .then((session) => {
        setAuthenticated(session.authenticated);
        if (session.authenticated) {
          return Promise.all([fetchJson<Content>("/api/admin/content"), fetchJson<AdminOrder[]>("/api/admin/orders")]).then(([adminContent, adminOrders]) => {
            setDraft(adminContent);
            setOrders(adminOrders);
          });
        }
        return undefined;
      })
      .catch(() => setAuthenticated(false));
  }, []);

  async function login() {
    setError("");
    setStatus("");
    try {
      await fetchJson("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      const [adminContent, adminOrders] = await Promise.all([fetchJson<Content>("/api/admin/content"), fetchJson<AdminOrder[]>("/api/admin/orders")]);
      setDraft(adminContent);
      setOrders(adminOrders);
      setAuthenticated(true);
      setPassword("");
      setStatus("Signed in.");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Sign-on failed.");
    }
  }

  async function logout() {
    await fetchJson("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setOrders([]);
    setStatus("");
  }

  async function save() {
    setSaving(true);
    setStatus("");
    setError("");
    try {
      const saved = await fetchJson<Content>("/api/admin/content", { method: "PUT", body: JSON.stringify(draft) });
      setDraft(saved);
      onContentSaved(saved);
      setStatus("Administration changes saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function updatePortfolio(index: number, patch: Partial<ImageItem>) {
    setDraft((value) => ({
      ...value,
      portfolio: value.portfolio.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function addPortfolioItem() {
    setDraft((value) => ({
      ...value,
      portfolio: [
        {
          title: "New Artwork",
          medium: "Original artwork",
          image: "",
          description: "",
          price: 0,
          available: false,
          commissioned: false,
          sold: false,
          gift: false,
          sequence: 1,
        },
        ...value.portfolio,
      ].map((item, index) => index === 0 ? item : { ...item, sequence: portfolioSequence(item, index - 1) + 1 }),
    }));
  }

  function removePortfolioItem(index: number) {
    setDraft((value) => ({ ...value, portfolio: value.portfolio.filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function refreshPortfolio() {
    setRefreshingPortfolio(true);
    setStatus("");
    setError("");
    try {
      const refreshed = await fetchJson<Content>("/api/admin/portfolio/refresh", { method: "POST" });
      setDraft(refreshed);
      onContentSaved(refreshed);
      setStatus(`Portfolio refreshed from local folders. ${refreshed.portfolio.length} artwork items found.`);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Portfolio refresh failed.");
    } finally {
      setRefreshingPortfolio(false);
    }
  }

  async function refreshOrders() {
    setRefreshingOrders(true);
    setStatus("");
    setError("");
    try {
      const nextOrders = await fetchJson<AdminOrder[]>("/api/admin/orders");
      setOrders(nextOrders);
      setSelectedOrderIds((ids) => ids.filter((id) => nextOrders.some((order) => order.paypalOrderId === id)));
      setStatus("Order history refreshed.");
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "Order refresh failed.");
    } finally {
      setRefreshingOrders(false);
    }
  }

  function toggleOrderSelection(orderId: string, selected: boolean) {
    setSelectedOrderIds((ids) => selected ? Array.from(new Set([...ids, orderId])) : ids.filter((id) => id !== orderId));
  }

  async function clearSelectedOrders() {
    setStatus("");
    setError("");
    if (!selectedOrderIds.length) {
      setError("Select at least one order to clear.");
      return;
    }

    try {
      const result = await fetchJson<{ deleted: number; orders: AdminOrder[] }>("/api/admin/orders", {
        method: "DELETE",
        body: JSON.stringify({ orderIds: selectedOrderIds }),
      });
      setOrders(result.orders);
      setSelectedOrderIds([]);
      setStatus(`${result.deleted} order${result.deleted === 1 ? "" : "s"} cleared.`);
    } catch (clearError) {
      setError(clearError instanceof Error ? clearError.message : "Clear orders failed.");
    }
  }

  if (!authenticated) {
    return (
      <section className="grid min-h-[calc(100vh-74px)] place-items-center bg-[#052434] px-4 py-12 text-paper">
        <div className="w-full max-w-md border border-[#a7d4cb]/20 bg-white/[0.06] p-6 shadow-fine">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-11 place-items-center border border-[#a7d4cb]/25 text-[#a7d4cb]">
              <Lock size={19} />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-semibold">Admin Sign-On</h1>
              <p className="mt-1 text-sm text-paper/70">Manage artwork, prices, and PayPal readiness.</p>
            </div>
          </div>
          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#a7d4cb]">Admin Password</span>
            <input
              className="h-11 border border-[#a7d4cb]/20 bg-[#021722] px-3 text-paper outline-none focus:border-[#a7d4cb]"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void login();
              }}
            />
          </label>
          <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 bg-[#a7d4cb] px-4 text-sm font-bold uppercase tracking-[0.14em] text-[#052434]" onClick={login} type="button">
            <LogIn size={17} />
            Sign On
          </button>
          {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
        </div>
      </section>
    );
  }

  return (
    <PageFrame eyebrow="Private console" title="Administration">
      <div className="mb-6 flex flex-wrap gap-3">
        <button className="button-primary" disabled={saving} onClick={save} type="button">
          <Save size={17} />
          {saving ? "Saving" : "Save Changes"}
        </button>
        <button className="button-secondary" onClick={() => onNavigate("/")} type="button">
          <Home size={17} />
          Site
        </button>
        <button className="button-secondary" onClick={logout} type="button">
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
      {status ? <p className="mb-4 border border-green-700/20 bg-green-50 p-3 text-sm font-semibold text-green-800">{status}</p> : null}
      {error ? <p className="mb-4 border border-red-700/20 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p> : null}

      <div className="grid gap-8">
        <section className="bg-gallery p-5 shadow-fine">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-semibold">Order Tracking</h2>
              <p className="mt-1 text-sm text-graphite">Short-term PayPal order history for completed artwork purchases.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="button-secondary" disabled={!selectedOrderIds.length} onClick={clearSelectedOrders} type="button">
                <Trash2 size={17} />
                Clear Orders
              </button>
              <button className="button-secondary" disabled={refreshingOrders} onClick={refreshOrders} type="button">
                <Sparkles size={17} />
                {refreshingOrders ? "Refreshing" : "Refresh Orders"}
              </button>
            </div>
          </div>
          {orders.length ? (
            <div className="grid gap-4">
              {orders.map((order) => (
                <article className="grid gap-4 border border-ink/10 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]" key={order.paypalOrderId}>
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-clay">
                          <input
                            className="size-4 accent-[#052434]"
                            type="checkbox"
                            checked={selectedOrderIds.includes(order.paypalOrderId)}
                            onChange={(event) => toggleOrderSelection(order.paypalOrderId, event.target.checked)}
                          />
                          Select
                        </label>
                        <h3 className="font-serif text-2xl font-semibold text-[#052434]">{order.artworkTitle || "Artwork order"}</h3>
                        <span className="bg-[#99d5e4] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#052434]">{order.status}</span>
                        {order.mock ? <span className="bg-[#bef1fe] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#052434]">Mock</span> : null}
                      </div>
                      <button className="button-secondary" onClick={() => downloadReceipt(order)} type="button">
                        <FileText size={17} />
                        Receipt
                      </button>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm leading-6 text-graphite sm:grid-cols-2">
                      <ConfigLine label="Order ID" value={order.paypalOrderId} />
                      <ConfigLine label="Capture ID" value={order.paypalCaptureId || "Pending"} />
                      <ConfigLine label="Amount" value={formatCurrency(Number(order.amount ?? 0))} />
                      <ConfigLine label="Mode" value={order.mode} />
                      <ConfigLine label="Buyer" value={order.payerName || "Not returned"} />
                      <ConfigLine label="Email" value={order.payerEmail || "Not returned"} />
                      <ConfigLine label="Created" value={new Date(order.createdAt).toLocaleString()} />
                      <ConfigLine label="Updated" value={new Date(order.updatedAt).toLocaleString()} />
                    </div>
                  </div>
                  <div className="border border-ink/10 bg-white p-4 text-sm leading-6 text-graphite">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">Shipping</p>
                    {order.shippingAddress?.lines?.length ? (
                      <div className="mt-2">
                        <p className="font-semibold text-ink">{order.shippingName || order.shippingAddress.name}</p>
                        {order.shippingAddress.lines.map((line) => <p key={line}>{line}</p>)}
                      </div>
                    ) : (
                      <p className="mt-2">No shipping address returned by PayPal for this order.</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="border border-ink/10 bg-white p-4 text-sm leading-6 text-graphite">No completed artwork orders have been recorded yet.</p>
          )}
        </section>

        <section className="bg-gallery p-5 shadow-fine">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-semibold">Artwork Sales</h2>
              <p className="mt-1 text-sm text-graphite">Describe images, set prices, and mark pieces available for sale.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="button-secondary" disabled={refreshingPortfolio} onClick={refreshPortfolio} type="button">
                <Sparkles size={17} />
                {refreshingPortfolio ? "Refreshing" : "Refresh Portfolio"}
              </button>
              <button className="button-secondary" onClick={addPortfolioItem} type="button">
                <Plus size={17} />
                Add
              </button>
            </div>
          </div>
          <div className="grid gap-5">
            {draft.portfolio.map((item, index) => (
              <article className="grid gap-4 border border-ink/10 p-4 lg:grid-cols-[160px_1fr]" key={`${item.title}-${index}`}>
                <img className="aspect-square w-full object-cover" src={item.image || "/"} alt={item.title || "Artwork preview"} />
                <div className="grid gap-3">
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px]">
                    <AdminInput label="Title" value={item.title} onChange={(value) => updatePortfolio(index, { title: value })} />
                    <AdminInput label="Medium" value={item.medium ?? ""} onChange={(value) => updatePortfolio(index, { medium: value })} />
                    <AdminInput label="Sequence" type="number" value={String(portfolioSequence(item, index))} onChange={(value) => updatePortfolio(index, { sequence: Number(value) })} />
                  </div>
                  <AdminInput label="Image URL" value={item.image} onChange={(value) => updatePortfolio(index, { image: value })} />
                  <AdminTextarea label="Description" value={item.description ?? ""} onChange={(value) => updatePortfolio(index, { description: value })} />
                  <div className="grid items-end gap-3 md:grid-cols-[220px_minmax(160px,1fr)_minmax(150px,1fr)_minmax(120px,1fr)_minmax(100px,1fr)_140px]">
                    <AdminPriceInput value={Number(item.price ?? 0)} onChange={(value) => updatePortfolio(index, { price: value })} />
                    <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-graphite">
                      <input className="size-4 accent-[#052434]" type="checkbox" checked={Boolean(item.available)} onChange={(event) => updatePortfolio(index, { available: event.target.checked })} />
                      Available for sale
                    </label>
                    <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-graphite">
                      <input className="size-4 accent-[#052434]" type="checkbox" checked={Boolean(item.commissioned)} onChange={(event) => updatePortfolio(index, { commissioned: event.target.checked })} />
                      Commissioned
                    </label>
                    <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-graphite">
                      <input className="size-4 accent-[#052434]" type="checkbox" checked={Boolean(item.sold)} onChange={(event) => updatePortfolio(index, { sold: event.target.checked })} />
                      Sold
                    </label>
                    <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-graphite">
                      <input className="size-4 accent-[#052434]" type="checkbox" checked={Boolean(item.gift)} onChange={(event) => updatePortfolio(index, { gift: event.target.checked })} />
                      Gift
                    </label>
                    <button className="button-secondary self-end" onClick={() => removePortfolioItem(index)} type="button">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-gallery p-5 shadow-fine">
          <h2 className="font-serif text-3xl font-semibold">PayPal Administration</h2>
          <div className="mt-4 grid gap-3 text-sm text-graphite">
            <ConfigLine label="Mode" value={paypalConfig.mode} />
            <ConfigLine label="Client ID" value={paypalConfig.clientId ? "Configured" : "Missing"} />
            <ConfigLine label="Server credentials" value={paypalConfig.serverVerified ? "Configured" : "Missing"} />
            <ConfigLine label="Local mock payments" value={paypalConfig.devMockPayments ? "Enabled" : "Disabled"} />
          </div>
          <p className="mt-4 text-sm leading-6 text-graphite">
            Secret PayPal values stay in environment variables. Artwork sale prices are managed in the Artwork Sales section.
          </p>
        </section>

      </div>
    </PageFrame>
  );
}

function AdminInput({ label, value, onChange, type = "text", step }: { label: string; value: string; onChange: (value: string) => void; type?: string; step?: string }) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-clay">{label}</span>
      <input className="h-11 min-w-0 border border-ink/15 bg-white px-3 text-sm text-ink outline-none focus:border-clay" step={step} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function formatAdminPrice(value: number) {
  return Math.min(Math.max(value, 0), 999999999.99).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function AdminPriceInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [displayValue, setDisplayValue] = useState(formatAdminPrice(value));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDisplayValue(formatAdminPrice(value));
    }
  }, [isEditing, value]);

  function rawValue(input: string) {
    return input.replace(/,/g, "");
  }

  function handleChange(input: string) {
    const raw = rawValue(input);
    if (!/^\d{0,9}(\.\d{0,2})?$/.test(raw)) {
      return;
    }

    setDisplayValue(input);
    onChange(raw ? Math.min(Number(raw), 999999999.99) : 0);
  }

  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-clay">Price</span>
      <input
        className="h-11 min-w-0 border border-ink/15 bg-white px-3 text-sm text-ink outline-none focus:border-clay"
        inputMode="decimal"
        type="text"
        value={displayValue}
        onBlur={() => {
          setIsEditing(false);
          setDisplayValue(formatAdminPrice(value));
        }}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => {
          setIsEditing(true);
          setDisplayValue(value ? String(value) : "");
        }}
      />
    </label>
  );
}

function AdminTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-clay">{label}</span>
      <textarea className="min-h-24 border border-ink/15 bg-white px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-clay" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ConfigLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border border-ink/10 px-3 py-2">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NotFoundPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <PageFrame eyebrow="404" title="Page not found">
      <button className="button-primary" onClick={() => onNavigate("/")} type="button">
        <Home size={17} />
        Home
      </button>
    </PageFrame>
  );
}

function SiteFooter({ content }: { content: Content }) {
  return (
    <footer className="border-t border-ink/10 bg-[#052434] text-paper">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 text-center md:grid-cols-3">
          <FooterBlock title="Location">{content.site.location}</FooterBlock>
          <FooterBlock title="Hours">{content.site.hours}</FooterBlock>
          <FooterBlock title="Contact">{content.site.email}</FooterBlock>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {content.socialLinks.map((link) => (
            <a className="social-link border-paper/20 bg-[#99d5e4] text-[#052434] hover:border-[#bef1fe] hover:bg-[#bef1fe] hover:text-ink" href={link.url} key={link.label} rel="noreferrer" target="_blank">
              {link.label}
            </a>
          ))}
        </div>
        <div className="mt-8 border-t border-paper/18 pt-5 text-center">
          <p className="text-sm leading-6 text-paper/72">
            © 2026, TrippintheCurl or its affiliates. All Rights Reserved. Made with OpenAI CodeX, a little patience, a little imagination, and yes a little love. Hosted on Render.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-paper/72">{children}</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
