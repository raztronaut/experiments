import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver
vi.stubGlobal('ResizeObserver', class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
});

// Mock matchMedia
vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
})));

// Mock WebGL - Only in JSDOM, don't override in real browser tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isBrowser = typeof window !== 'undefined' && (typeof (window as any).process === 'undefined' || (window as any).process.env?.VITEST_BROWSER);
if (typeof window !== 'undefined' && !isBrowser) {
    HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
        if (contextId === 'webgl' || contextId === 'experimental-webgl' || contextId === 'webgl2') {
            return {
                getExtension: vi.fn(),
                getParameter: vi.fn(),
                createTexture: vi.fn(),
                bindTexture: vi.fn(),
                texParameteri: vi.fn(),
                texImage2D: vi.fn(),
                createBuffer: vi.fn(),
                bindBuffer: vi.fn(),
                bufferData: vi.fn(),
                enable: vi.fn(),
                disable: vi.fn(),
                blendFunc: vi.fn(),
                createProgram: vi.fn(),
                createShader: vi.fn(),
                shaderSource: vi.fn(),
                compileShader: vi.fn(),
                attachShader: vi.fn(),
                linkProgram: vi.fn(),
                getProgramParameter: vi.fn(),
                getShaderParameter: vi.fn(),
                useProgram: vi.fn(),
                getAttribLocation: vi.fn(),
                getUniformLocation: vi.fn(),
                enableVertexAttribArray: vi.fn(),
                vertexAttribPointer: vi.fn(),
                uniform1f: vi.fn(),
                uniform1i: vi.fn(),
                uniform2f: vi.fn(),
                uniform3f: vi.fn(),
                drawArrays: vi.fn(),
                getShaderPrecisionFormat: vi.fn().mockReturnValue({
                    rangeMin: 1,
                    rangeMax: 1,
                    precision: 1
                }),
                clearColor: vi.fn(),
                clear: vi.fn(),
            };
        }
        return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
}
