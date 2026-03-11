import { loader } from "fumadocs-core/source";
import { registryDocs } from "@/.source/server";

export const registrySource = loader({
  baseUrl: "/registry/docs",
  source: registryDocs.toFumadocsSource(),
});
