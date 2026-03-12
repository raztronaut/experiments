import { SITE_URL } from "@/lib/constants";
import {
  generateBreadcrumbJsonLd,
  generateCreativeWorkJsonLd,
  safeJsonLdStringify,
} from "@/lib/structured-data";

interface ExperimentJsonLdProps {
  description: string;
  slug: string;
  tags?: string[];
  title: string;
}

export function ExperimentJsonLd({
  title,
  description,
  slug,
  tags,
}: ExperimentJsonLdProps) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(
            generateCreativeWorkJsonLd({ title, description, slug, tags })
          ),
        }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(
            generateBreadcrumbJsonLd([
              { name: "Home", url: SITE_URL },
              {
                name: title,
                url: `${SITE_URL}/experiments/${slug}`,
              },
            ])
          ),
        }}
        type="application/ld+json"
      />
    </>
  );
}
