export const particleSwirlVertex = /* glsl */ `
  uniform float time;
  uniform vec2 mousePosition;
  uniform float scrollProgress;

  attribute float aRandom;
  attribute float aPhase;

  varying float vAlpha;

  float hash31(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    float a = hash31(i);
    float b = hash31(i + vec3(1.0, 0.0, 0.0));
    float c = hash31(i + vec3(0.0, 1.0, 0.0));
    float d = hash31(i + vec3(1.0, 1.0, 0.0));
    float e = hash31(i + vec3(0.0, 0.0, 1.0));
    float f1 = hash31(i + vec3(1.0, 0.0, 1.0));
    float g = hash31(i + vec3(0.0, 1.0, 1.0));
    float h = hash31(i + vec3(1.0, 1.0, 1.0));

    return mix(
      mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
      mix(mix(e, f1, u.x), mix(g, h, u.x), u.y),
      u.z
    );
  }

  void main() {
    vec3 pos = position;

    float t = time * 0.3;
    float phase = aPhase * 6.28318;

    // Orbital motion around the origin
    float orbitRadius = length(pos.xz) + 0.1;
    float orbitAngle = atan(pos.z, pos.x) + t * (0.2 + aRandom * 0.3) + phase;
    float verticalDrift = noise(vec3(pos.x * 0.5, t * 0.2, aRandom * 10.0)) * 2.0 - 1.0;

    pos.x = cos(orbitAngle) * orbitRadius;
    pos.z = sin(orbitAngle) * orbitRadius;
    pos.y += verticalDrift * 0.5;

    // Noise-driven displacement for tendril effect
    float n1 = noise(pos * 1.5 + t);
    pos += vec3(n1 - 0.5, n1 * 0.7 - 0.35, n1 * n1 - 0.25) * 0.8;

    // Cursor attraction/repulsion
    vec2 cursorWorld = mousePosition * 2.0;
    vec2 toParticle = pos.xz - cursorWorld;
    float cursorDist = length(toParticle);
    float cursorForce = smoothstep(2.0, 0.0, cursorDist) * 0.5;
    pos.xz += normalize(toParticle + 0.001) * cursorForce;

    // Scroll influences spread
    float spread = 1.0 + scrollProgress * 0.5;
    pos *= spread;

    vAlpha = 0.05 + aRandom * 0.15;
    vAlpha *= smoothstep(5.0, 1.0, length(pos));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (1.5 + aRandom * 1.5) * (25.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleSwirlFragment = /* glsl */ `
  varying float vAlpha;

  void main() {
    float dist = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = smoothstep(1.0, 0.4, dist) * vAlpha;
    gl_FragColor = vec4(0.85, 0.85, 0.9, alpha);
  }
`;
