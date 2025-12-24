interface UmamiTrackProperties {
    hostname?: string;
    language?: string;
    referrer?: string;
    screen?: string;
    title?: string;
    url?: string;
    website?: string;
    name?: string;
    data?: Record<string, string | number | boolean>;
}

interface Umami {
    track(event: string, data?: Record<string, string | number | boolean>): void;
    track(callback: (props: UmamiTrackProperties) => UmamiTrackProperties): void;
    identify(sessionId: string, data?: Record<string, unknown>): void;
    identify(data: Record<string, unknown>): void;
}

declare global {
    interface Window {
        umami?: Umami;
    }
    const umami: Umami | undefined;
}

export { };
