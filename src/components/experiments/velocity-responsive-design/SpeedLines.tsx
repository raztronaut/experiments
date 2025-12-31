"use client";

import { useRef, useEffect } from "react";
import { useVelocityState } from "./VelocityContext";

export const SpeedLines: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { normalizedVelocity } = useVelocityState();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particles: { x: number, y: number, length: number, speed: number }[] = [];
        const particleCount = 40;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                length: Math.random() * 100 + 50,
                speed: Math.random() * 5 + 2
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            if (normalizedVelocity < 0.1) {
                animationFrameId = requestAnimationFrame(draw);
                return;
            }

            const centerX = width / 2;
            const centerY = height / 2;

            particles.forEach(p => {
                const distanceX = p.x - centerX;
                const distanceY = p.y - centerY;
                const angle = Math.atan2(distanceY, distanceX);
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                // Opacity based on velocity and distance from center
                const opacity = normalizedVelocity * 0.5 * (distance / (width / 2));
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 0.5 + normalizedVelocity * 1.5;

                ctx.beginPath();
                ctx.moveTo(p.x, p.y);

                // Line length increases with velocity and distance from center
                const lineLength = p.length * normalizedVelocity * (distance / (width / 2));
                const endX = p.x + Math.cos(angle) * lineLength;
                const endY = p.y + Math.sin(angle) * lineLength;

                ctx.lineTo(endX, endY);
                ctx.stroke();

                // Move particles away from center
                const speed = p.speed * normalizedVelocity * 20;
                p.x += Math.cos(angle) * speed;
                p.y += Math.sin(angle) * speed;

                // Reset particles if they go off screen
                if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
                    // Start near center
                    const startAngle = Math.random() * Math.PI * 2;
                    const startDistance = Math.random() * 200;
                    p.x = centerX + Math.cos(startAngle) * startDistance;
                    p.y = centerY + Math.sin(startAngle) * startDistance;
                    p.length = Math.random() * 80 + 20;
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, [normalizedVelocity]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen"
        />
    );
};
