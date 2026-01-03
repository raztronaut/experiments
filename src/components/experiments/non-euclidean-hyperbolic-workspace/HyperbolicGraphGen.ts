import { Complex } from './HyperbolicMath';
import {
    BrainCircuit,
    Code2,
    Dna,
    FileText,
    Image as ImageIcon,
    Layout,
    Library,
    Music,
    Palette,
    Shapes,
    Sparkles,
    Terminal,
    Video,
    LucideIcon
} from 'lucide-react';

export type NodeType = 'root' | 'area' | 'project' | 'note' | 'media';

export interface GraphNode {
    id: string;
    logicalPos: Complex;
    label: string;
    type: NodeType;
    icon?: LucideIcon;
}

export interface GraphEdge {
    sourceId: string;
    targetId: string;
}

const ICONS = [Code2, FileText, ImageIcon, Music, Video, Terminal, Palette, Layout, Shapes, Dna, Library, Sparkles];

/**
 * Procedural Tree Generation in Hyperbolic Space
 * In hyperbolic space, circumference grows exponentially.
 * We can fit a regular tree where every node has K children, effectively forever.
 */
export const generateHyperbolicTree = (): { nodes: GraphNode[], edges: GraphEdge[] } => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Root at origin
    const root: GraphNode = {
        id: 'root',
        logicalPos: new Complex(0, 0),
        label: 'My Second Brain',
        type: 'root',
        icon: BrainCircuit
    };
    nodes.push(root);

    // BFS Queue
    const queue: { parent: GraphNode, level: number, angleStart: number, angleEnd: number }[] = [];
    queue.push({ parent: root, level: 0, angleStart: 0, angleEnd: 2 * Math.PI });

    let nodeCount = 1;

    // Radial layout layers (Poincare radius)
    // Pack tighter near center, spacing out towards edge
    // Optimized for 3-4 layers: spread them out a bit more to breathe
    const radii = [0, 0.40, 0.70, 0.88, 0.95];

    while (queue.length > 0) {
        const { parent, level, angleStart, angleEnd } = queue.shift()!;
        if (level >= 3) continue; // Max depth 3 (Root + 3 layers = 4 layers total)

        const r = radii[level + 1];

        // Organic branching factor based on level
        // Reduced for cleaner demo
        let minB = 2, maxB = 3;
        if (level === 0) { minB = 3; maxB = 4; } // Areas (fewer)
        if (level === 1) { minB = 2; maxB = 3; } // Projects (fewer)
        if (level === 2) { minB = 1; maxB = 2; } // Notes (very few leaf nodes)

        const count = Math.floor(Math.random() * (maxB - minB + 1)) + minB;

        // Adding randomness to angle spans
        const totalSpan = angleEnd - angleStart;
        const angleStep = totalSpan / count;

        for (let i = 0; i < count; i++) {
            const theta = angleStart + angleStep * i + angleStep / 2;

            // Jitter: +/- 20% of the step
            const jitter = (Math.random() - 0.5) * angleStep * 0.4;
            const finalTheta = theta + jitter;

            // Helper to randomly pick icon
            const RandomIcon = ICONS[Math.floor(Math.random() * ICONS.length)];

            let type: NodeType = 'note';
            let label = `Note ${nodeCount}`;
            if (level === 0) { type = 'area'; label = ['Dev', 'Writing', 'Health', 'Art', 'Finance', 'Travel'][i % 6] || 'Area'; }
            else if (level === 1) { type = 'project'; label = `Project ${String.fromCharCode(65 + i)}`; }
            else if (Math.random() > 0.8) { type = 'media'; label = 'Attachment'; }

            const pos = new Complex(r * Math.cos(finalTheta), r * Math.sin(finalTheta));
            const id = `node-${nodeCount++}`;

            const newNode: GraphNode = {
                id,
                logicalPos: pos,
                label,
                type,
                icon: level < 3 ? RandomIcon : undefined
            };

            nodes.push(newNode);
            edges.push({ sourceId: parent.id, targetId: newNode.id });

            queue.push({
                parent: newNode,
                level: level + 1,
                angleStart: angleStart + angleStep * i,
                angleEnd: angleStart + angleStep * (i + 1)
            });
        }
    }

    return { nodes, edges };
};
