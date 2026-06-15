import { useMemo } from 'react';
import i18n from '../../locales/i18n';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const DEFAULT_SITE_NAME = i18n.t('app.title');
const DEFAULT_DESCRIPTION = i18n.t('app.subtitle');
const DEFAULT_URL = '';
const DEFAULT_IMAGE = '/og-image.png';

export function useSiteMetadata() {
  return useMemo(() => ({
    siteName: import.meta.env.VITE_SITE_NAME || DEFAULT_SITE_NAME,
    siteDescription: import.meta.env.VITE_SITE_DESCRIPTION || DEFAULT_DESCRIPTION,
    siteUrl: import.meta.env.VITE_SITE_URL || DEFAULT_URL,
    siteImage: import.meta.env.VITE_SITE_IMAGE || DEFAULT_IMAGE,
  }), []);
}

export function SEOHead({ 
  title, 
  description, 
  image, 
  url,
  type = 'website' 
}: SEOHeadProps) {
  const { siteName, siteDescription, siteUrl, siteImage } = useSiteMetadata();
  
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullDescription = description || siteDescription;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image ? `${siteUrl}${image}` : siteImage;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": siteName,
    "description": siteDescription,
    "url": siteUrl,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Universidad de Pamplona"
    }
  };

  return (
    <>
      <title>{fullTitle}</title>
      
      <meta name="description" content={fullDescription} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />
      
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteName} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      <meta property="og:locale" content="es_CO" />
      <meta property="og:locale:alternate" content="en_US" />
      
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </>
  );
}