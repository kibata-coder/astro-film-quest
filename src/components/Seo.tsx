import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://soudflex.pages.dev';

interface SeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Per-route SEO tags. Sets a unique <title>, meta description,
 * self-referencing canonical, and og:title/og:description/og:url so
 * each route is indexed as its own leaf page. Optionally injects
 * structured data (JSON-LD).
 */
const Seo = ({ title, description, canonicalPath, jsonLd }: SeoProps) => {
  const location = useLocation();
  const path = canonicalPath ?? location.pathname;
  const url = `${SITE_URL}${path === '/' ? '' : path}`;
  const fullTitle = title.length > 60 ? title.slice(0, 57) + '…' : title;
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={url} />
      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
