export const crtVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const crtFragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D map;
  uniform float time;
  uniform float glitchIntensity;
  uniform float imageAspect;
  uniform float planeAspect;
  uniform vec2 iResolution;
  uniform float rs;

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

  vec2 curve(vec2 uv) {
    uv = (uv - 0.5) * 2.0;
    uv *= 1.1; // Slight scale up to hide black edges
    uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
    uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
    uv = (uv / 2.0) + 0.5;
    return uv;
  }

  void main() {
    vec2 uv = curve(vUv);
    
    // Mask out of bounds
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // Chromatic aberration
    vec3 col;
    col.r = texture2D(map, coverUV(vec2(uv.x + rs, uv.y))).r;
    col.g = texture2D(map, coverUV(vec2(uv.x, uv.y))).g;
    col.b = texture2D(map, coverUV(vec2(uv.x - rs, uv.y))).b;

    // RGB Subpixel simulation
    float subpixelX = uv.x * iResolution.x * 2.5; 
    vec3 subpixel = vec3(
        0.5 + 0.5 * cos(subpixelX),
        0.5 + 0.5 * cos(subpixelX + 2.094),
        0.5 + 0.5 * cos(subpixelX + 4.188)
    );
    col *= subpixel;

    // Scanlines
    float scanline = 0.7 + 0.3 * sin(uv.y * iResolution.y * 1.2);
    col *= scanline;

    // Phosphor glow
    col += col * col * 0.2;

    // Vignette
    float vig = 16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    col *= vec3(pow(vig, 0.25));

    // Dither
    col += (hash(uv.x * 12.0 + uv.y * 42.0 + time) - 0.5) / 255.0;

    gl_FragColor = vec4(col * 1.8, 1.0);
  }
`;
