export const heroVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const heroFragmentShader = /* glsl */ `
precision mediump float;

uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

// Simplex-style hash
vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 2; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// IQ color palette
vec3 palette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.00, 0.10, 0.20);
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  uv.x *= aspect;

  float t = uTime * 0.15;
  float prog = uProgress;
  
  // Offset by mouse
  uv += uMouse * 0.1;

  // Single-level domain warping (q → f) for cheaper GPU cost
  vec2 q = vec2(fbm(uv + t * 0.4), fbm(uv + vec2(1.7, 9.2) + t * 0.3));
  float f = fbm(uv + 4.0 * q + prog * 2.0);

  // Color mix driven by scroll progress
  vec3 col1 = palette(f * 0.8 + prog * 0.3);
  vec3 col2 = vec3(0.035, 0.035, 0.05);
  float blend = smoothstep(-0.2, 1.2, f * 0.5 + 0.5);
  blend = mix(blend, blend * 0.6, prog);

  vec3 color = mix(col2, col1 * 0.7, blend * 0.45);

  // Subtle vignette
  vec2 vigUv = vUv * 2.0 - 1.0;
  float vig = 1.0 - dot(vigUv * 0.5, vigUv * 0.5);
  color *= smoothstep(0.0, 1.0, vig);

  gl_FragColor = vec4(color, 1.0);
}
`;
