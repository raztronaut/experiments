import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from "fumadocs-ui/layouts/flux/page";
import { notFound } from "next/navigation";
import { registrySource } from "@/lib/registry-source";
import { getMDXComponents } from "@/mdx-components";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = registrySource.getPage(slug);
  if (!page) {
    notFound();
  }

  const MDXContent = page.data.body;
  const frontmatter = page.data as unknown as Record<string, unknown>;
  const lastModified =
    typeof frontmatter.lastModified === "string"
      ? new Date(frontmatter.lastModified)
      : null;

  return (
    <DocsPage tableOfContent={{ style: "clerk" }} toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent components={getMDXComponents()} />
      </DocsBody>
      {lastModified && <PageLastUpdate date={lastModified} />}
    </DocsPage>
  );
}

export function generateStaticParams() {
  return registrySource.generateParams();
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = registrySource.getPage(slug);
  if (!page) {
    return {};
  }

  const itemSlug = slug?.[slug.length - 1];
  const ogImage = itemSlug
    ? `/registry/${itemSlug}/opengraph-image`
    : undefined;

  return {
    title: page.data.title,
    description: page.data.description,
    ...(ogImage && {
      openGraph: {
        title: page.data.title,
        description: page.data.description,
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
    }),
  };
}
