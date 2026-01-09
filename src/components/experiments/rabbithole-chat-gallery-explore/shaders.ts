export const vertexShader = `
varying vec2 vUv;

attribute vec3 aInitialPosition;
attribute float aMeshSpeed;
attribute vec4 aTextureCoords;
attribute float aAspectRatio;


uniform float uTime;
uniform vec2 uMaxXdisplacement;
uniform vec2 uDrag;

uniform float uSpeedY;
uniform float uScrollY;


varying float vVisibility;
varying vec4 vTextureCoords;


//linear smoothstep
float remap(float value, float originMin, float originMax)
{
    return clamp((value - originMin) / (originMax - originMin),0.,1.);
}

void main()
{     
    
    vec3 newPosition=position;
    // Apply aspect ratio scaling
    // Assuming base geometry is square 1x1. AspectRatio = width/height.
    // We keep width constant and adjust height? Or vice versa.
    // Preloader did: scaledPosition.y/=aAspectRatio;
    // If AR=2 (wide), y becomes 0.5. Result 1x0.5 -> 2:1. Correct.
    newPosition.y /= aAspectRatio;
    
    newPosition += aInitialPosition;


    float maxX = uMaxXdisplacement.x;
    float maxY = uMaxXdisplacement.y;

    float maxYoffset = distance(aInitialPosition.y,maxY);
    float minYoffset = distance(aInitialPosition.y,-maxY);

    
    float maxXoffset = distance(aInitialPosition.x,maxX);
    float minXoffset = distance(aInitialPosition.x,-maxX);
    
    
    float xDisplacement = mod(minXoffset -uDrag.x + uTime * aMeshSpeed, maxXoffset+minXoffset) - minXoffset;
    float yDisplacement = mod(minYoffset -uDrag.y, maxYoffset+minYoffset) - minYoffset;

    // Modified depth range for better visibility with our camera setup
    float maxZ = 12.;
    float minZ = -30.;
    
    float maxZoffset = distance(aInitialPosition.z,maxZ);    
    float minZoffset = distance(aInitialPosition.z,minZ);    
    
    float zDisplacement = mod(uScrollY + minZoffset,maxZoffset + minZoffset ) - minZoffset;    
    
    // Add extra "floating" movement on Z and Y axis for liveness
    float floatSpeed = 0.5;
    float floatAmp = 0.2;
    newPosition.z += sin(uTime * floatSpeed * aMeshSpeed + aInitialPosition.x) * floatAmp;
    
    newPosition.x += xDisplacement; 
    newPosition.y += yDisplacement;
    newPosition.z += zDisplacement;


    vVisibility = remap(newPosition.z, minZ, minZ+5.);
    

    vec4 modelPosition = modelMatrix * instanceMatrix * vec4(newPosition, 1.0);        


    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;    

    vUv = uv;
    vTextureCoords = aTextureCoords;
}
`;

export const fragmentShader = `
varying vec2 vUv;
varying float vVisibility;
varying vec4 vTextureCoords;

uniform sampler2D uAtlas;
uniform sampler2D uBlurryAtlas;

void main()
{            
    // Get UV coordinates for this image from the uniform array
    float xStart = vTextureCoords.x;
    float xEnd = vTextureCoords.y;
    float yStart = vTextureCoords.z;
    float yEnd = vTextureCoords.w;

     vec2 atlasUV = vec2(
        mix(xStart, xEnd, vUv.x),
        mix(yStart, yEnd, 1.-vUv.y) // Inverted Y for correct orientation
    );     
    
    vec2 atlasUV_standard = vec2(
        mix(xStart, xEnd, vUv.x),
        mix(yStart, yEnd, 1.-vUv.y)
    );

    vec4 color = texture2D(uAtlas, atlasUV_standard);
    
    // Tighten alpha to remove dark halos from canvas anti-aliasing
    // Canvas alpha is often premultiplied or blended with black, causing dark edges when linear filtered.
    // We boost the alpha curve to cut out the semi-transparent black fringe.
    color.a = smoothstep(0.01, 0.1, color.a) * color.a;
    if (color.a < 0.01) discard;

    color.a *= vVisibility;

    // Saturation/Brightness caps from original
    color.r = min(color.r, 1.);
    color.g = min(color.g, 1.);
    color.b = min(color.b, 1.);

    gl_FragColor = color;
}
`;
