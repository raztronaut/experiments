export const volumetricLightFragmentShader = /* glsl */ `
  #include <common>
  #include <packing>

  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform sampler2D tDepth;

  uniform float cameraNear;
  uniform float cameraFar;
  uniform mat4 projectionMatrixInverse;
  uniform mat4 viewMatrixInverse;
  uniform vec3 cameraPos;
  uniform float time;
  uniform float scrollProgress;

  uniform vec3 light1Position;
  uniform vec3 light1Direction;
  uniform vec3 light1Color;
  uniform float light1ConeAngle;

  uniform vec3 light2Position;
  uniform vec3 light2Direction;
  uniform vec3 light2Color;
  uniform float light2ConeAngle;

  uniform vec3 light3Position;
  uniform vec3 light3Direction;
  uniform vec3 light3Color;
  uniform float light3ConeAngle;

  const float SCATTERING_ANISO = 0.3;
  const int NUM_STEPS = 64;
  const float STEP_SIZE = 0.15;
  const float TRANSMITTANCE_CUTOFF = 0.01;
  const float LIGHT_INTENSITY = 2.0;
  const float FOG_DENSITY = 0.04;

  vec3 getWorldPosition(vec2 uv, float depth) {
    float clipZ = depth * 2.0 - 1.0;
    vec2 ndc = uv * 2.0 - 1.0;
    vec4 clip = vec4(ndc, clipZ, 1.0);
    vec4 view = projectionMatrixInverse * clip;
    vec4 world = viewMatrixInverse * view;
    return world.xyz / world.w;
  }

  float HGPhase(float mu) {
    float g = SCATTERING_ANISO;
    float gg = g * g;
    float denom = max(1.0 + gg - 2.0 * g * mu, 0.0001);
    return (1.0 - gg) / (denom * sqrt(denom));
  }

  // ... (rest of the helper functions remain same)

  float hash31(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float cheapNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    float a = hash31(i);
    float b = hash31(i + vec3(1, 0, 0));
    float c = hash31(i + vec3(0, 1, 0));
    float d = hash31(i + vec3(1, 1, 0));
    float e = hash31(i + vec3(0, 0, 1));
    float f1 = hash31(i + vec3(1, 0, 1));
    float g = hash31(i + vec3(0, 1, 1));
    float h = hash31(i + vec3(1, 1, 1));

    return mix(
      mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
      mix(mix(e, f1, u.x), mix(g, h, u.x), u.y),
      u.z
    ) * 2.0 - 1.0;
  }

  float fogNoise(vec3 p) {
    vec3 q = p + time * 0.15 * vec3(1.0, -0.2, -1.0);
    return (hash31(floor(q)) * 2.0 - 1.0) * 0.5;
  }

  float sdCone(vec3 p, vec3 origin, vec3 dir, float halfAngle) {
    vec3 toP = p - origin;
    float projLen = dot(toP, dir);
    if (projLen < 0.0) return 1000.0;
    float distFromAxis = length(toP - dir * projLen);
    float coneRadius = projLen * tan(halfAngle);
    return distFromAxis - coneRadius;
  }

  vec3 computeLight(
    vec3 rayOrigin, vec3 rayDir, float sceneDepth,
    vec3 lightPos, vec3 lightDir, vec3 lightColor, float coneAngle
  ) {
    float halfAngle = radians(coneAngle) * 0.5;
    float transmittance = 1.0;
    vec3 accumulated = vec3(0.0);

    float offset = fract(sin(dot(vUv * 512.0, vec2(12.9898, 78.233))) * 43758.5453);
    float t = STEP_SIZE * offset;

    for (int i = 0; i < NUM_STEPS; i++) {
      if (t > sceneDepth || t > cameraFar || transmittance < TRANSMITTANCE_CUTOFF) break;

      vec3 samplePos = rayOrigin + rayDir * t;
      float sdfVal = sdCone(samplePos, lightPos, lightDir, halfAngle);

      if (sdfVal < 0.3) {
        float shapeFactor = -sdfVal + fogNoise(samplePos * 0.5) * 0.3;

        if (shapeFactor > 0.05) {
          float distToLight = length(samplePos - lightPos);
          vec3 sampleLightDir = normalize(samplePos - lightPos);

          float attenuation = exp(-0.15 * distToLight);
          float scatter = HGPhase(dot(rayDir, -sampleLightDir));
          vec3 luminance = lightColor * LIGHT_INTENSITY * attenuation * scatter;

          float stepDensity = FOG_DENSITY * clamp(shapeFactor, 0.0, 1.0);
          float stepTrans = exp(-stepDensity * STEP_SIZE);
          transmittance *= stepTrans;
          accumulated += luminance * transmittance * stepDensity * STEP_SIZE;
        }
      }

      t += STEP_SIZE;
    }

    return accumulated;
  }

  void main() {
    vec4 sceneColor = texture2D(tDiffuse, vUv);
    float depth = texture2D(tDepth, vUv).x;

    float linearDepth = perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
    float sceneDepth = -linearDepth;

    vec3 worldPos = getWorldPosition(vUv, depth);
    vec3 rayOrigin = cameraPos;
    vec3 rayDir = normalize(worldPos - rayOrigin);

    vec3 totalLight = vec3(0.0);
    totalLight += computeLight(rayOrigin, rayDir, sceneDepth, light1Position, light1Direction, light1Color, light1ConeAngle);
    totalLight += computeLight(rayOrigin, rayDir, sceneDepth, light2Position, light2Direction, light2Color, light2ConeAngle);
    totalLight += computeLight(rayOrigin, rayDir, sceneDepth, light3Position, light3Direction, light3Color, light3ConeAngle);

    // Soft Reinhard tone mapping on volumetric contribution
    totalLight = totalLight / (1.0 + totalLight);

    vec3 finalColor = sceneColor.rgb + totalLight * 0.4;

    // Gradient dithering to prevent banding
    finalColor += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const volumetricLightVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;
