---
description: Add images, 3D models, fonts, or other static assets to an experiment
---

# Add Assets to Experiment Workflow

## Prerequisites
- Experiment already exists
- Have the asset files ready

## Steps

1. **Verify/create the asset directory**:
   ```
   public/experiments/<experiment-name>/
   ```
   (Created automatically by scaffolding, but verify it exists)

2. **Copy assets to the directory**:
   ```
   public/experiments/<name>/image.png
   public/experiments/<name>/model.glb
   public/experiments/<name>/font.woff2
   ```

3. **Reference in code** using absolute paths from public root:
   ```tsx
   // Images
   <img src="/experiments/<name>/image.png" alt="description" />
   
   // Next.js Image (preferred for optimization)
   import Image from 'next/image';
   <Image 
     src="/experiments/<name>/image.png" 
     alt="description"
     width={400}
     height={300}
   />
   
   // 3D Models with React Three Fiber
   import { useGLTF } from '@react-three/drei';
   const { scene } = useGLTF('/experiments/<name>/model.glb');
   
   // Fonts (in CSS or layout)
   @font-face {
     font-family: 'CustomFont';
     src: url('/experiments/<name>/font.woff2') format('woff2');
   }
   ```

## Asset Type Guidelines

### Images
- Use WebP or AVIF for best compression
- Provide appropriate sizes (don't load 4K images for thumbnails)
- Use Next.js `<Image>` component for optimization when possible
- For background patterns or textures, consider inline SVG data URIs

### 3D Models
- GLB format preferred (binary glTF, smaller file size)
- Optimize models before adding:
  - Reduce polygon count if needed
  - Compress textures
  - Remove unused materials
- Preload for better UX:
  ```tsx
  useGLTF.preload('/experiments/<name>/model.glb');
  ```
- For complex scenes, consider lazy loading:
  ```tsx
  const Model = lazy(() => import('./HeavyModel'));
  ```

### Videos
- Use MP4 (H.264) for broad compatibility
- Consider WebM for better compression on modern browsers
- Add poster frame for initial display:
  ```tsx
  <video 
    src="/experiments/<name>/video.mp4" 
    poster="/experiments/<name>/poster.jpg"
    controls
    playsInline
    muted // Required for autoplay
  />
  ```
- For background videos, use `loop` and `muted` attributes

### Fonts
- WOFF2 format preferred (best compression)
- Subset fonts to only needed characters if possible
- Define in experiment's layout.tsx or a local CSS file:
  ```css
  @font-face {
    font-family: 'ExperimentFont';
    src: url('/experiments/<name>/font.woff2') format('woff2');
    font-display: swap;
  }
  ```

### Audio
- MP3 for broad compatibility
- OGG/WebM for better quality at smaller sizes
- Always provide user controls (no auto-playing audio)
  ```tsx
  const [audioRef] = useRef<HTMLAudioElement>(null);
  
  <audio ref={audioRef} src="/experiments/<name>/sound.mp3" />
  <button onClick={() => audioRef.current?.play()}>Play Sound</button>
  ```

## File Size Considerations

| Asset Type | Recommended Max Size | Notes |
|------------|---------------------|-------|
| Images | < 500KB | Use compression, appropriate dimensions |
| 3D Models | < 5MB | Consider LOD for complex models |
| Videos | < 20MB | Consider streaming for longer videos |
| Fonts | < 100KB | Subset to needed characters |
| Audio | < 2MB | Use appropriate bitrate |

## Cleanup Note

When an experiment is deleted via `npm run delete:experiment`, all assets in `public/experiments/<name>/` are automatically removed.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on asset | Check path starts with `/experiments/` (no `public/` prefix) |
| GLTF not loading | Ensure file is `.glb` or `.gltf` with proper structure |
| Image not optimizing | Use Next.js `<Image>` component instead of `<img>` |
| Asset too large | Compress/optimize before adding to repo |
| Font not applying | Check `font-family` name matches in CSS |
| Video not autoplaying | Add `muted` attribute (browser requirement) |
