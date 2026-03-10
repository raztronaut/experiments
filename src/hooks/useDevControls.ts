"use client";

/**
 * Leva controls wrapper with dead-code elimination in production.
 *
 * By default, `useDevControls` returns static defaults in production and
 * leva is tree-shaken from the bundle. Pass `{ production: true }` to keep
 * leva available in production (e.g. for showcase experiments that expose
 * debug tools to visitors via `?debug`).
 */

type SchemaInput = Record<string, { value: unknown; [k: string]: unknown }>;
type SchemaOutput<T extends SchemaInput> = { [K in keyof T]: T[K]["value"] };

export function useDevControls<T extends SchemaInput>(
  folder: string,
  schema: T,
  options?: { production?: boolean }
): SchemaOutput<T> {
  const keepInProd = options?.production === true;

  if (process.env.NODE_ENV !== "development" && !keepInProd) {
    const result = {} as Record<string, unknown>;
    for (const key of Object.keys(schema)) {
      result[key] = schema[key].value;
    }
    return result as SchemaOutput<T>;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const leva = require("leva") as typeof import("leva");
  // biome-ignore lint/correctness/useHookAtTopLevel: conditional is compile-time dead-code eliminated
  return leva.useControls(folder, schema) as SchemaOutput<T>;
}
