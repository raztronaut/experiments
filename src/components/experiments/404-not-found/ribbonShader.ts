export const vertexShader = `
uniform float uTime;
uniform float uFrequency;
uniform float uAmplitude;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vModelNormal;
varying float vIndent;

void main() {
  vUv = uv;
  vModelNormal = normal;
  
  vec3 newPosition = position;
  
  // Position-based offset for variety between ribbons
  float xPos = position.x * uFrequency + uTime;
  
  // Main curve - only in Z (depth) to prevent vertical clipping
  float indent = sin(xPos) * uAmplitude;
  
  // Add some layered noise/harmonics for paper-like character
  indent += sin(xPos * 2.1 + 0.4) * uAmplitude * 0.3;
  indent += sin(xPos * 4.4 + 1.2) * uAmplitude * 0.1;

  newPosition.z += indent;
  
  vIndent = indent;
  vNormal = normalize(normalMatrix * normal);
  vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

export const fragmentShader = `
uniform sampler2D uTexture;
uniform sampler2D uBackTexture;
uniform vec2 uBackOffset;
uniform vec2 uBackScale;
uniform float uOpacity;
uniform float uTime;
uniform float uRunTime;
uniform vec3 uColor;
uniform vec2 uRepeat;
uniform vec2 uBackRepeat;
uniform float uBackClamp;
uniform float uTextSpeed;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vModelNormal;
varying float vIndent;

float random(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  
  vec4 texColor;
  
  // Front face is positive Z model normal, back face is negative Z
  if (vModelNormal.z > 0.5) {
      // Scroll the text using independent scroll time
      // uTextSpeed is now pre-multiplied by JS
      float scrollOffset = uRunTime * uTextSpeed;
      vec2 tiledUv = vUv * uRepeat + vec2(scrollOffset, 0.0);
      vec4 sampleCol = texture2D(uTexture, tiledUv);
      
      // Composite: Texture (Text/Lines) over Background (uColor)
      texColor = vec4(mix(uColor, sampleCol.rgb, sampleCol.a), 1.0);
      
  } else if (vModelNormal.z < -0.5) {
      // Use normal UV for the back side
      vec2 backUv;
      
      if (uBackClamp > 0.5) {
          // Clamped/Masked Image (Instagram feed style)
          backUv = vec2(vUv.x, vUv.y) * uBackScale + uBackOffset;
          if (backUv.x >= 0.0 && backUv.x <= 1.0 && backUv.y >= 0.0 && backUv.y <= 1.0) {
              texColor = texture2D(uBackTexture, backUv);
          } else {
              texColor = vec4(uColor, 1.0);
          }
      } else {
          // Repeating Text (Backside)
          backUv = vUv * uBackRepeat;
          vec4 sampleCol = texture2D(uBackTexture, backUv);
          texColor = vec4(mix(uColor, sampleCol.rgb, sampleCol.a), 1.0);
      }
  } else {
      texColor = vec4(uColor, 1.0);
  }
  
  // Lighting setup - matching mockup's warm, directional light
  // Key light: From top-right, more front-facing to fix darkness
  vec3 lightDir1 = normalize(vec3(0.5, 0.8, 0.8));
  float diff1 = max(dot(normal, lightDir1), 0.0);
  
  // Subtle fill from bottom-left
  vec3 lightDir2 = normalize(vec3(-0.5, -0.2, 0.4));
  float diff2 = max(dot(normal, lightDir2), 0.0) * 0.3;
  
  // Specular Reflection (the "nice reflection" the user likes)
  vec3 halfDir = normalize(lightDir1 + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 32.0) * 0.4;
  
  vec3 faceColor = texColor.rgb;
  
  // Deepening shadows in "valleys"
  float shadow = smoothstep(1.0, -1.0, vIndent);
  shadow = mix(0.6, 1.0, shadow);
  
  // Ambient occlusion simulation
  float edgeAO = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
  edgeAO = mix(0.7, 1.0, edgeAO);
  
  // Rim lighting
  float rim = 1.0 - max(dot(viewDir, normal), 0.0);
  rim = pow(rim, 6.0) * 0.25;
  
  // High-frequency Grain
  float grain = (random(vUv * 100.0 + uTime * 0.001) - 0.5) * 0.03;
  
  vec3 finalColor = faceColor;
  
  // Apply lighting: Key + Fill + Spec + Shadow + EdgeAO + Rim
  finalColor *= (diff1 * 0.8 + diff2 + 0.25);
  finalColor *= shadow;
  finalColor *= edgeAO;
  
  // Add Specular and Rim on top
  finalColor += spec * vec3(1.0, 0.95, 0.8) * diff1; // Warm specular tied to key light
  finalColor += rim * vec3(1.0, 0.98, 0.95);
  finalColor += grain;
  
  gl_FragColor = vec4(finalColor, uOpacity * texColor.a);
}
`;
