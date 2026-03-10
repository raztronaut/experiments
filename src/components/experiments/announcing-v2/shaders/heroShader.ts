export const heroVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const heroFragmentShader = /* glsl */ `
  uniform float time;
  uniform float scrollProgress;
  uniform vec2 resolution;
  varying vec2 vUv;

  // Simplex-style hash
  vec3 hash3(vec2 p) {
    vec3 q = vec3(
      dot(p, vec2(127.1, 311.7)),
      dot(p, vec2(269.5, 183.3)),
      dot(p, vec2(419.2, 371.9))
    );
    return fract(sin(q) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = dot(hash3(i + vec2(0.0, 0.0)).xy - 0.5, f - vec2(0.0, 0.0));
    float b = dot(hash3(i + vec2(1.0, 0.0)).xy - 0.5, f - vec2(1.0, 0.0));
    float c = dot(hash3(i + vec2(0.0, 1.0)).xy - 0.5, f - vec2(0.0, 1.0));
    float d = dot(hash3(i + vec2(1.0, 1.0)).xy - 0.5, f - vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) + 0.5;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = resolution.x / resolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    float t = time * 0.08;
    float sp = scrollProgress;

    // Domain-warped FBM
    float n1 = fbm(p * 2.0 + t);
    float n2 = fbm(p * 3.0 - t * 0.7 + vec2(n1 * 0.5));
    float n3 = fbm(p * 1.5 + vec2(n2 * 0.8, n1 * 0.3) + t * 0.3);

    // Dark palette: deep navy to muted purple to near-black
    vec3 col1 = vec3(0.02, 0.02, 0.06); // near-black
    vec3 col2 = vec3(0.05, 0.03, 0.12); // deep purple
    vec3 col3 = vec3(0.08, 0.06, 0.15); // muted purple
    vec3 col4 = vec3(0.03, 0.06, 0.10); // deep teal

    vec3 color = mix(col1, col2, smoothstep(0.3, 0.6, n3));
    color = mix(color, col3, smoothstep(0.5, 0.8, n2) * 0.6);
    color = mix(color, col4, smoothstep(0.4, 0.7, n1) * 0.4);

    // Subtle bright accent near center, scroll-reactive
    float centerDist = length(p);
    float pulse = smoothstep(0.8, 0.0, centerDist) * 0.08;
    color += vec3(0.1, 0.05, 0.15) * pulse * (1.0 + sin(t * 2.0) * 0.3);

    // Scroll darkens edges
    float vignette = 1.0 - centerDist * (0.3 + sp * 0.4);
    color *= max(vignette, 0.3);

    // Film grain (dithering)
    float grain = (fract(sin(dot(uv * resolution, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.03;
    color += grain;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;
