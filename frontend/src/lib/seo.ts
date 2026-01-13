export const SEO_DEFAULTS = {
  siteName: "WriteWave",
  baseUrl: "https://www.example.com",
  title: "WriteWave - Master Japanese Writing",
  description:
    "Learn Hiragana, Katakana, and Kanji through structured lessons and community-driven practice. Free Japanese language learning platform.",
  ogImage: "https://lovable.dev/opengraph-image-p98pqg.png",
};

export function buildCanonicalUrl(pathname?: string): string {
  const normalizedPath = pathname ? pathname.replace(/^\//, "") : "";
  const suffix = normalizedPath.length > 0 ? `/${normalizedPath}` : "/";
  return `${SEO_DEFAULTS.baseUrl}${suffix}`;
}


