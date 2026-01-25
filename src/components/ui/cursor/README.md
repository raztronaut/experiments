# iPad Cursor System

A high-performance, elastic cursor system for React, inspired by iPadOS.

## Usage

### 1. Wrap your Layout
The `CursorProvider` must wrap the part of the application where you want the cursor to appear.

```tsx
import { CursorProvider } from '@/components/ui/cursor/Provider';

export default function Layout({ children }) {
  return (
    <CursorProvider>
      {children}
    </CursorProvider>
  );
}
```

### 2. Mark Interactive Elements
Use the `WithHover` component to make any element interactive with the cursor.

#### Snapping (Block) Cursor
This is the default mode. The cursor will morph into a rounded rectangle that encapsulates the element.

```tsx
import { WithHover } from '@/components/ui/cursor/WithHover';

<WithHover>
  <button>Click Me</button>
</WithHover>
```

#### Text Cursor
Use this for headlines or text links. The cursor transforms into a slim vertical bar.

```tsx
<WithHover type="text">
  <h1>Hover this Title</h1>
</WithHover>
```

### 3. Customizing the Interaction
You can pass a `config` object to `WithHover`:

- `hoverOffset`: Controls the "magnetic" pull strength (default is `4`). Set to `0` to disable magnetic element movement while keeping the cursor snapping.

```tsx
<WithHover config={{ hoverOffset: 2 }}>
  <IconButton />
</WithHover>
```

### 4. Global Control
You can access the cursor context via `useCursor()` to manually hide or reveal the cursor.

```tsx
const { setIsHidden } = useCursor();

// Use this when opening modals or drawers
useEffect(() => {
  setIsHidden(true);
  return () => setIsHidden(false);
}, []);
```

## How it Works
- **Context API**: Tracks mouse position and the currently hovered element's bounding box.
- **GSAP**: Handles all animations for high performance and smooth elastic easing.
- **Mix-Blend-Mode**: The cursor uses `mix-blend-difference` to remain visible across all background colors.
- **mergeRefs**: Allows `WithHover` to work with elements that already have their own refs.
