import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://soudflex.pages.dev';

interface SeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
}

/**
 * Per-route SEO tags. Sets a unique <title>, meta description,
 * self-referencing canonical, and og:title/og:description/og:url so
 * each route is indexed as its own leaf page.
 */
const Seo = ({ title, description, canonicalPath }: SeoProps) => {
  const location = useLocation();
  const path = canonicalPath ?? location.pathname;
  const url = `${SITE_URL}${path === '/' ? '' : path}`;
  const fullTitle = title.length > 60 ? title.slice(0, 57) + '…' : title;

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
    </Helmet>
  );
};

export default Seo;
