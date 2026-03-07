---
description: Create a new component within an existing experiment
---

# Add Component to Experiment Workflow

## Prerequisites
- Experiment already exists
- Know the component's purpose and name

## Steps

1. **Create the component file**:
   ```
   src/components/experiments/<experiment-name>/<ComponentName>.tsx
   ```

2. **Use this template**:
   ```tsx
   "use client";
   
   import React from 'react';
   import { cn } from '@/lib/utils';
   
   interface <ComponentName>Props {
     className?: string;
     children?: React.ReactNode;
   }
   
   export function <ComponentName>({ className, children }: <ComponentName>Props) {
     return (
       <div className={cn("", className)}>
         {children}
       </div>
     );
   }
   ```

3. **Create the test file** (optional but recommended):
   ```
   src/components/experiments/<experiment-name>/<ComponentName>.test.tsx
   ```
   
   ```tsx
   import { describe, it, expect } from 'vitest';
   import { render, screen } from '@testing-library/react';
   import { <ComponentName> } from './<ComponentName>';
   
   describe('<ComponentName>', () => {
     it('renders without crashing', () => {
       render(<<ComponentName> />);
       // Add assertions
     });
   });
   ```

4. **Import into parent component or page**:
   ```tsx
   import { <ComponentName> } from './<ComponentName>';
   // or from page.tsx:
   import { <ComponentName> } from '@/components/experiments/<name>/<ComponentName>';
   ```

## Import Rules Reminder

```tsx
// ✅ ALLOWED in any experiment component
import { cn } from "@/lib/utils";
import { Button, Card } from "@/components/ui/button";
import { LocalComponent } from "./LocalComponent";
import { motion } from "motion/react";
import * as THREE from "three";

// ❌ NEVER DO THIS
import { ComponentFromOther } from "@/components/experiments/other-experiment/...";
```

## Patterns for Common Component Types

### Animated Component
```tsx
"use client";

import { motion } from 'motion/react';

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
}
```

### 3D Component
```tsx
"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export function SpinningBox() {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}
```

### Interactive Component with State
```tsx
"use client";

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export function TogglePanel({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return (
    <div className={cn("relative", className)}>
      <button onClick={toggle}>Toggle</button>
      {isOpen && <div>Panel Content</div>}
    </div>
  );
}
```

### Component with useEffect Cleanup
```tsx
"use client";

import { useEffect, useRef } from 'react';

export function EventListenerComponent() {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const handleScroll = () => {
      // handle scroll
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // ALWAYS return cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return <div ref={elementRef}>...</div>;
}
```
