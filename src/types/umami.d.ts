interface UmamiTrackProperties {
  data?: Record<string, string | number | boolean>;
  hostname?: string;
  language?: string;
  name?: string;
  referrer?: string;
  screen?: string;
  title?: string;
  url?: string;
  website?: string;
}

interface Umami {
  identify(sessionId: string, data?: Record<string, unknown>): void;
  identify(data: Record<string, unknown>): void;
  track(event: string, data?: Record<string, string | number | boolean>): void;
  track(callback: (props: UmamiTrackProperties) => UmamiTrackProperties): void;
}

declare global {
  interface Window {
    umami?: Umami;
  }
  const umami: Umami | undefined;
}

export {};
