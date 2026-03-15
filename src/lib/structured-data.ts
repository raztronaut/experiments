import type {
  BreadcrumbList,
  CreativeWork,
  ItemList,
  Person,
  ProfilePage,
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
    givenName: "Razi",
    familyName: "Syed",
    alternateName: ["Razi", "raztronaut"],
    url: SITE_URL,
    sameAs: [GITHUB_URL, TWITTER_URL],
    jobTitle: "Design Engineer",
  };
}

export function generateWebSiteJsonLd(): {
  "@context": "https://schema.org";
  "@graph": [
    WithContext<Person>,
    WithContext<WebSite>,
    WithContext<ProfilePage>,
  ];
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
        inLanguage: "en-US",
      },
      {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        name: SITE_TITLE,
        url: SITE_URL,
        mainEntity: personRef(),
        dateCreated: "2025-01-01",
        dateModified: "2025-01-01",
      },
    ],
  };
}

interface ExperimentListItem {
  description: string;
  slug: string;
  title: string;
}

export function generateExperimentListJsonLd(
  experiments: ExperimentListItem[]
): WithContext<ItemList> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Creative Coding Experiments",
    description: SITE_DESCRIPTION,
    numberOfItems: experiments.length,
    itemListElement: experiments.map((exp, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: exp.title,
      description: exp.description,
      url: `${SITE_URL}/experiments/${exp.slug}`,
    })),
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
  const experimentUrl = `${SITE_URL}/experiments/${params.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: params.title,
    description: params.description,
    datePublished: params.datePublished,
    ...(params.dateModified && { dateModified: params.dateModified }),
    about: {
      "@type": "CreativeWork",
      url: experimentUrl,
    },
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
    inLanguage: "en-US",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".p-name", ".e-content"],
    },
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

export function generateCreativeWorkJsonLd(
  params: ExperimentJsonLdParams
): WithContext<CreativeWork> {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: params.title,
    description: params.description,
    url: `${SITE_URL}/experiments/${params.slug}`,
    creator: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    isAccessibleForFree: true,
    inLanguage: "en-US",
    ...(params.tags &&
      params.tags.length > 0 && { keywords: params.tags.join(", ") }),
  };
}
