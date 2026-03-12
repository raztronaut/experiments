export const crtVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const crtFragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform float imageAspect;
  uniform float planeAspect;
  uniform float glitchIntensity;
  uniform float time;
  uniform vec2 iResolution;
  varying vec2 vUv;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  // Branchless aspect-ratio-correct UV (like CSS object-fit: cover)
  vec2 coverUV(vec2 uv) {
    float ratioA = imageAspect / planeAspect;
    float ratioB = planeAspect / imageAspect;
    float sel = step(planeAspect, imageAspect);
    float sX = mix(1.0, ratioB, sel);
    float sY = mix(ratioA, 1.0, sel);
    uv.x = uv.x * sX + (1.0 - sX) * 0.5;
    uv.y = uv.y * sY + (1.0 - sY) * 0.5;
    return uv;
  }

  void main() {
    vec2 uv = vUv;
    float gi = glitchIntensity;

    // Horizontal row jitter + vertical offset during glitch
    uv.x += (hash(floor(uv.y * 20.0 + time * 80.0) + time * 7.0) - 0.5) * 2.0 * gi * 0.15;
    uv.y += (hash(floor(time * 50.0)) - 0.5) * gi * 0.06;

    // Chromatic aberration spread (subtle at rest, amplified during glitch)
    float rs = 0.001 + gi * 0.025;

    vec3 col;
    col.r = texture2D(map, coverUV(vec2(uv.x + rs, uv.y + rs))).r + 0.05;
    col.g = texture2D(map, coverUV(vec2(uv.x, uv.y - rs * 2.0))).g + 0.05;
    col.b = texture2D(map, coverUV(vec2(uv.x - rs * 2.0, uv.y))).b + 0.05;

    // Soft phosphor glow bleed
    col.r += 0.08 * texture2D(map, coverUV(vec2(uv.x + 0.026, uv.y - 0.026))).r;
    col.g += 0.05 * texture2D(map, coverUV(vec2(uv.x - 0.022, uv.y - 0.022))).g;
    col.b += 0.08 * texture2D(map, coverUV(vec2(uv.x - 0.022, uv.y - 0.018))).b;

    // Soft glow via quadratic self-illumination
    col = clamp(col * 0.93 + 0.07 * col * col, 0.0, 1.0);

    // Vignette
    col *= vec3(pow(16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.12));

    // Phosphor tint + brightness
    col *= vec3(0.95, 1.05, 0.95) * 2.5;

    // Scanlines
    float scanline = 0.6 + 0.4 * pow(clamp(0.35 + 0.35 * sin(uv.y * iResolution.y * 1.5), 0.0, 1.0), 1.2);
    col *= scanline;

    // RGB sub-pixel columns
    col *= 1.0 - 0.65 * vec3(clamp((mod(vUv.x * iResolution.x, 2.0) - 1.0) * 2.0, 0.0, 1.0));

    // Static noise during glitch
    col += vec3(hash(uv.x * 100.0 + uv.y * 1000.0 + time * 300.0) * gi * 0.3);

    // Gradient dithering to prevent banding
    col += (hash(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + time) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
  }
`;
