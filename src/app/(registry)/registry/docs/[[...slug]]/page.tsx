import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  EditOnGitHub,
} from "fumadocs-ui/layouts/flux/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import { registrySource } from "@/lib/registry-source";

const GITHUB_REPO = "https://github.com/raztronaut/experiments";
const CONTENT_DIR = "content/registry";

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
  const slugPath = slug?.join("/") ?? "";

  return (
    <DocsPage
      toc={page.data.toc}
      tableOfContent={{ style: "clerk" }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent components={getMDXComponents()} />
      </DocsBody>
      <EditOnGitHub
        href={`${GITHUB_REPO}/blob/main/${CONTENT_DIR}/${slugPath}.mdx`}
      />
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
  const ogImage = itemSlug ? `/registry/${itemSlug}/opengraph-image` : undefined;

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
