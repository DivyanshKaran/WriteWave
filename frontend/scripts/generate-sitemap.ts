import fs from "node:fs";
import path from "node:path";

const BASE_URL = "https://www.example.com"; // replace in production

// Minimal static route list; extend as needed
const routes = ["/", "/learn", "/community", "/about"];

function generateXml(urls: string[]): string {
  const items = urls
    .map(
      (loc) => `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${items}\n` +
    `</urlset>\n`;
}

const urls = routes.map((r) => {
  const normalized = r.startsWith("/") ? r : `/${r}`;
  return `${BASE_URL}${normalized}`;
});

const xml = generateXml(urls);

const outPath = path.resolve(process.cwd(), "public", "sitemap.xml");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, xml, "utf8");
console.log(`Sitemap written to ${outPath}`);


