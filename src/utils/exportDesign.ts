import { jsPDF } from 'jspdf';
import { DesignLayer } from '../types/studio';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    lines.push(current);
  }
  return lines;
}

export async function renderDesignToCanvas(params: {
  width: number;
  height: number;
  backgroundColor: string;
  layers: DesignLayer[];
  scale?: number;
}): Promise<HTMLCanvasElement> {
  const scale = params.scale ?? 2;
  const canvas = document.createElement('canvas');
  canvas.width = params.width * scale;
  canvas.height = params.height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize 2D export canvas');
  }

  ctx.scale(scale, scale);
  ctx.fillStyle = params.backgroundColor || '#090C12';
  ctx.fillRect(0, 0, params.width, params.height);

  for (const layer of params.layers) {
    if (!layer.visible) continue;

    const x = (layer.x / 100) * params.width;
    const y = (layer.y / 100) * params.height;
    const w = (layer.width / 100) * params.width;
    const h = (layer.height / 100) * params.height;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity ?? 1));

    if (layer.rotation) {
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.translate(cx, cy);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    if (layer.type === 'rect') {
      const r = Math.min(layer.borderRadius ?? 0, w / 2, h / 2);
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      if (layer.color) {
        ctx.fillStyle = layer.color;
        ctx.fill();
      }
      if (layer.strokeColor && layer.strokeWidth) {
        ctx.strokeStyle = layer.strokeColor;
        ctx.lineWidth = layer.strokeWidth;
        ctx.stroke();
      }
    } else if (layer.type === 'circle') {
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      if (layer.color) {
        ctx.fillStyle = layer.color;
        ctx.fill();
      }
      if (layer.strokeColor && layer.strokeWidth) {
        ctx.strokeStyle = layer.strokeColor;
        ctx.lineWidth = layer.strokeWidth;
        ctx.stroke();
      }
    } else if (layer.type === 'image' && layer.imageUrl) {
      try {
        const img = await loadImage(layer.imageUrl);
        const imgRatio = img.width / img.height;
        const boxRatio = w / h;
        let sx = 0;
        let sy = 0;
        let sw = img.width;
        let sh = img.height;
        if (imgRatio > boxRatio) {
          sw = img.height * boxRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / boxRatio;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
      } catch {
        // Fallback fill if asset unavailable
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(x, y, w, h);
      }
    } else if (layer.type === 'svg' && layer.svgPath) {
      const viewBox = layer.svgViewBox || '0 0 100 100';
      const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}"><path d="${layer.svgPath}" fill="${layer.color || '#FFFFFF'}" fill-rule="evenodd" /></svg>`;
      const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      try {
        const img = await loadImage(url);
        ctx.drawImage(img, x, y, w, h);
      } finally {
        URL.revokeObjectURL(url);
      }
    } else if (layer.type === 'text' && layer.text) {
      const fontSize = (layer.fontSize ?? 48) * (params.width / 1080);
      const fontWeight = layer.fontWeight ?? '600';
      const fontFamily = layer.fontFamily ?? 'Plus Jakarta Sans';
      ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
      ctx.fillStyle = layer.color || '#FFFFFF';
      ctx.textBaseline = 'top';

      const align = layer.textAlign ?? 'left';
      ctx.textAlign = align;
      const anchorX =
        align === 'center' ? x + w / 2 : align === 'right' ? x + w : x;

      const lines = wrapTextLines(ctx, layer.text, w);
      const lineHeight = fontSize * (layer.lineHeight ?? 1.2);

      lines.forEach((line, idx) => {
        ctx.fillText(line, anchorX, y + idx * lineHeight);
      });
    }

    ctx.restore();
  }

  return canvas;
}

export async function downloadDesignAsPng(params: {
  title: string;
  width: number;
  height: number;
  backgroundColor: string;
  layers: DesignLayer[];
}) {
  const canvas = await renderDesignToCanvas({ ...params, scale: 2 });
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  const slug = params.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'design';
  link.download = `${slug}-${params.width}x${params.height}@2x.png`;
  link.href = dataUrl;
  link.click();
}

export async function downloadDesignAsPdf(params: {
  title: string;
  width: number;
  height: number;
  backgroundColor: string;
  layers: DesignLayer[];
}) {
  const canvas = await renderDesignToCanvas({ ...params, scale: 2 });
  const imgData = canvas.toDataURL('image/png', 1.0);
  const orientation = params.width >= params.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [params.width, params.height],
    hotfixes: ['px_scaling'],
  });
  pdf.addImage(imgData, 'PNG', 0, 0, params.width, params.height);
  const slug = params.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'design';
  pdf.save(`${slug}-print-ready.pdf`);
}
