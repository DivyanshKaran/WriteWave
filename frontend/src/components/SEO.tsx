import { Helmet } from "react-helmet-async";
import { SEO_DEFAULTS, buildCanonicalUrl } from "@/lib/seo";

type SEOProps = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function SEO(props: SEOProps) {
  const title = props.title ?? SEO_DEFAULTS.title;
  const description = props.description ?? SEO_DEFAULTS.description;
  const ogImage = props.ogImage ?? SEO_DEFAULTS.ogImage;
  const canonical = buildCanonicalUrl(props.canonicalPath);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {props.noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      <meta property="og:site_name" content={SEO_DEFAULTS.siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {props.jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(props.jsonLd)}
        </script>
      )}
    </Helmet>
  );
}


