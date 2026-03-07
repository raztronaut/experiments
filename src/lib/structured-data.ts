import type {
  BreadcrumbList,
  Person,
  SoftwareApplication,
  TechArticle,
  WebSite,
  WithContext,
} from "schema-dts";
import {
  AUTHOR_NAME,
  GITHUB_URL,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  TWITTER_URL,
} from "./constants";

/**
 * XSS-safe JSON.stringify for use with dangerouslySetInnerHTML.
 * Replaces `<` with unicode escape to prevent script injection.
 */
export function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const personId = `${SITE_URL}/#person`;

function personRef(): { "@id": string } {
  return { "@id": personId };
}

function personSchema(): WithContext<Person> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId,
    name: AUTHOR_NAME,
    url: SITE_URL,
    sameAs: [GITHUB_URL, TWITTER_URL],
    jobTitle: "Design Engineer",
  };
}

export function generateWebSiteJsonLd(): {
  "@context": "https://schema.org";
  "@graph": [WithContext<Person>, WithContext<WebSite>];
} {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personSchema(),
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_TITLE,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        author: personRef(),
      },
    ],
  };
}

interface ArticleJsonLdParams {
  dateModified?: string;
  datePublished: string;
  description: string;
  ogImageUrl: string;
  slug: string;
  tags?: string[];
  title: string;
}

export function generateArticleJsonLd(
  params: ArticleJsonLdParams
): WithContext<TechArticle> {
  const canonicalUrl = `${SITE_URL}/experiments/${params.slug}/article`;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: params.title,
    description: params.description,
    datePublished: params.datePublished,
    ...(params.dateModified && { dateModified: params.dateModified }),
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    image: `${SITE_URL}${params.ogImageUrl}`,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    ...(params.tags &&
      params.tags.length > 0 && { keywords: params.tags.join(", ") }),
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbJsonLd(
  items: BreadcrumbItem[]
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface ExperimentJsonLdParams {
  description: string;
  slug: string;
  tags?: string[];
  title: string;
}

export function generateExperimentJsonLd(
  params: ExperimentJsonLdParams
): WithContext<SoftwareApplication> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: params.title,
    description: params.description,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    url: `${SITE_URL}/experiments/${params.slug}`,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    ...(params.tags &&
      params.tags.length > 0 && { keywords: params.tags.join(", ") }),
  };
}
