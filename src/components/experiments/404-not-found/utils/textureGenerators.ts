import * as THREE from "three";

export interface FrontTextureParams {
    text: string;
    subscript: string;
    color: string;
    width: number;
    height: number;
    padding: number;
    fontsReady: boolean;
}

export interface BackTextureParams {
    text?: string;
    color: string;
    width: number;
    height: number;
    fontsReady: boolean;
}

export const generateFrontTexture = ({
    text,
    subscript,
    // color, // Removed as unused
    width,
    height,
    padding
}: FrontTextureParams): THREE.CanvasTexture | null => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const canvasHeight = 256;
    ctx.font = `900 ${canvasHeight * 0.6}px "Inter", "Arial Black", sans-serif`;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;

    let totalTextWidth = textWidth;
    if (subscript) {
        ctx.font = `900 ${canvasHeight * 0.3}px "Inter", "Arial Black", sans-serif`;
        totalTextWidth += ctx.measureText(subscript).width + 8;
    }

    const unitWidth = totalTextWidth + padding * 2;
    const canvasWidth = unitWidth;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Draw background - TRANSPARENT
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw red guide lines
    ctx.strokeStyle = "#be123c";
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight * 0.18); ctx.lineTo(canvasWidth, canvasHeight * 0.18);
    ctx.moveTo(0, canvasHeight * 0.82); ctx.lineTo(canvasWidth, canvasHeight * 0.82);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Draw text
    ctx.font = `900 ${canvasHeight * 0.6}px "Inter", "Arial Black", sans-serif`;
    ctx.fillStyle = "#0c0c0c";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = "-2px";
    ctx.fillText(text, padding, canvasHeight * 0.52);

    if (subscript) {
        ctx.font = `900 ${canvasHeight * 0.3}px "Inter", "Arial Black", sans-serif`;
        ctx.fillText(subscript, padding + textWidth - 4, canvasHeight * 0.65);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;

    const unitAspect = unitWidth / canvasHeight;
    const geomAspect = width / height;
    tex.repeat.set(geomAspect / unitAspect, 1);

    tex.anisotropy = 16;
    return tex;
};

export const generateBackTexture = ({
    text,
    // color, // Unused
    width,
    height
}: BackTextureParams): THREE.CanvasTexture | null => {
    // If no specifically provided text, we still want the "INSPIRED BY" repeating
    const baseBackText = text || "INSPIRED BY DAY JOB";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const canvasHeight = 256;
    // Match front side style but maybe different font variant
    ctx.font = `italic 900 ${canvasHeight * 0.45}px "Inter", "system-ui", sans-serif`;
    const textWidth = ctx.measureText(baseBackText).width;

    const backPadding = 120; // Nice loose spacing for repetition
    const unitWidth = textWidth + backPadding * 2;

    canvas.width = unitWidth;
    canvas.height = canvasHeight;

    // Transparent background, color handled in shader
    ctx.clearRect(0, 0, unitWidth, canvasHeight);

    // Guide lines
    ctx.strokeStyle = "#be123c";
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight * 0.18); ctx.lineTo(unitWidth, canvasHeight * 0.18);
    ctx.moveTo(0, canvasHeight * 0.82); ctx.lineTo(unitWidth, canvasHeight * 0.82);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Text
    ctx.font = `italic 900 ${canvasHeight * 0.45}px "Inter", "system-ui", sans-serif`;
    ctx.fillStyle = "#0c0c0c";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(baseBackText, unitWidth / 2, canvasHeight * 0.52);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;

    // Calculate repeat for text mode
    const unitAspect = unitWidth / canvasHeight;
    const geomAspect = width / height;
    tex.repeat.set(geomAspect / unitAspect, 1);

    return tex;
};
