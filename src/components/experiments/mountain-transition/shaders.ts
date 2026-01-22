// Simplex 2D noise & FBM
const noiseBenchmark = `
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 4; ++i) { // 4 Octaves is enough for smooth mist
        v += a * snoise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}
`;

export const vertexShader = `
  uniform sampler2D uDepth;
  uniform float uDisplacementStrength;
  uniform float uTime;
  
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vUv = uv;
    float depth = texture2D(uDepth, uv).r;
    vDepth = depth;
    vec3 pos = position;
    // Moderate displacement for volume
    pos.z += depth * uDisplacementStrength; 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const fragmentShader = `
  uniform float uProgress;
  uniform sampler2D uTex0;
  uniform sampler2D uTex1;
  uniform sampler2D uTex2;
  uniform sampler2D uTex3;
  uniform sampler2D uTex4;
  uniform sampler2D uDepth;
  uniform float uTime;
  
  varying vec2 vUv;
  varying float vDepth;
  
  ${noiseBenchmark}

  vec4 getTexture(int index, vec2 uv) {
    if (index == 0) return texture2D(uTex0, uv);
    if (index == 1) return texture2D(uTex1, uv);
    if (index == 2) return texture2D(uTex2, uv);
    if (index == 3) return texture2D(uTex3, uv);
    if (index == 4) return texture2D(uTex4, uv);
    return texture2D(uTex0, uv);
  }

  void main() {
    float totalScenes = 5.0;
    float rawP = uProgress * (totalScenes - 1.0);
    int index0 = int(floor(rawP));
    int index1 = int(ceil(rawP));
    float p = fract(rawP);
    
    vec4 col0 = getTexture(index0, vUv);
    vec4 col1 = getTexture(index1, vUv);
    
    // --- CINEMATIC MIST TRANSITION ---
    // Goal: A smooth, depth-aware blend.
    // Logic: Transition map = Depth (dominant) + Noise (organic variation).
    
    // Soft, large scale noise
    float noise = fbm(vUv * 3.0 + vec2(uTime * 0.05, 0.0)); 
    
    // Combine Depth and Noise.
    // User requested "Front to Back" transition.
    // vDepth: 1.0 = Near, 0.0 = Far.
    // We want Near to transition FIRST.
    // Logic: Transition happens when structure < threshold (creates mask=0 -> Col1).
    // As p increases, threshold increases (-0.2 -> 1.2).
    // So distinct values of 'structure' will follow the threshold.
    // Elements with LOW structure value will be caught by the threshold first.
    // So we want Foreground (Near) to have LOW structure.
    
    float structure = (1.0 - vDepth) * 0.8 + noise * 0.2; // Inverted Depth for Front-to-Back
    
    // P goes 0 -> 1.
    // Threshold sweeps from -0.2 to 1.2
    float threshold = p * 1.4 - 0.2;
    
    // Smoothness determines how "foggy" the specific transition line is
    float smoothness = 0.15;
    
    // Mix mask: 0 = Col0, 1 = Col1
    // structure > threshold ? 
    // If p=0, threshold=-0.2. structure (0..1) > -0.2. 
    // We want result to be Col0 (current).
    // So if structure > threshold, return Col0?
    // Let's use standard smoothstep logic.
    // factor = smoothstep(threshold - soft, threshold + soft, structure)
    // If p=0, threshold=-0.2. factor ~ 1.0. 
    // If p=1, threshold=1.2. factor ~ 0.0.
    // So factor goes 1 -> 0.
    
    float mask = smoothstep(threshold - smoothness, threshold + smoothness, structure);
    
    // mix(Col1, Col0, mask) -> 
    // mask=1 (start) -> Col0. 
    // mask=0 (end) -> Col1.
    
    gl_FragColor = mix(col1, col0, mask);
  }
`;
