import { createFromSource } from "fumadocs-core/search/server";
import { registrySource } from "@/lib/registry-source";

export const { GET } = createFromSource(registrySource);
