import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Callout } from "fumadocs-ui/components/callout";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...(defaultComponents as unknown as MDXComponents),
    Accordion,
    Accordions,
    Callout,
    File,
    Files,
    Folder,
    ImageZoom,
    Step,
    Steps,
    Tab,
    Tabs,
    TypeTable,
    ...components,
  } as MDXComponents;
}

export const useMDXComponents = getMDXComponents;
