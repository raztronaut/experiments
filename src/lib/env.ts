export const isDev = process.env.NODE_ENV === "development";
export const isPreview = process.env.VERCEL_ENV === "preview";
export const showDevContent = isDev || isPreview;
