/**
 * PNG export utility for dashboard visualizations and charts.
 * Provides canvas-based rendering for downloadable PNG images.
 */

export interface PNGExportOptions {
  width?: number;
  height?: number;
  scale?: number;
  backgroundColor?: string;
  quality?: number;
  filename?: string;
  mimeType?: 'image/png' | 'image/jpeg' | 'image/webp';
}

export interface CanvasRenderable {
  renderToCanvas(canvas: HTMLCanvasElement): Promise<void>;
  getWidth(): number;
  getHeight(): number;
}

/**
 * Default export options
 */
const DEFAULT_OPTIONS: Required<PNGExportOptions> = {
  width: 1200,
  height: 800,
  scale: 2,
  backgroundColor: '#0f0f23',
  quality: 1,
  filename: 'export',
  mimeType: 'image/png',
};

/**
 * Creates a canvas element with the specified dimensions and scale.
 */
function createCanvas(
  width: number,
  height: number,
  scale: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  return canvas;
}

/**
 * Gets the 2D rendering context from a canvas with proper scaling.
 */
function getContext(canvas: HTMLCanvasElement, scale: number): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D rendering context');
  }
  ctx.scale(scale, scale);
  return ctx;
}

/**
 * Renders a chart or visualization element to a canvas.
 */
async function renderElement(
  ctx: CanvasRenderingContext2D,
  element: CanvasRenderable,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  const elementCanvas = createCanvas(width, height, 1);
  await element.renderToCanvas(elementCanvas);
  ctx.drawImage(elementCanvas, x, y, width, height);
}

/**
 * Exports a single renderable element to PNG format.
 */
export async function exportToPNG(
  element: CanvasRenderable | HTMLElement,
  options: PNGExportOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const scale = opts.scale ?? 2;

  // Determine dimensions
  let width: number;
  let height: number;

  if (element instanceof HTMLElement) {
    const rect = element.getBoundingClientRect();
    width = opts.width ?? rect.width;
    height = opts.height ?? rect.height;
  } else {
    width = opts.width ?? element.getWidth();
    height = opts.height ?? element.getHeight();
  }

  const canvas = createCanvas(width, height, scale);
  const ctx = getContext(canvas, scale);

  // Fill background
  ctx.fillStyle = opts.backgroundColor ?? '#0f0f23';
  ctx.fillRect(0, 0, width, height);

  // Render the element
  if (element instanceof HTMLElement) {
    await renderHTMLElement(ctx, element, width, height);
  } else {
    await renderElement(ctx, element, 0, 0, width, height);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      },
      opts.mimeType ?? 'image/png',
      opts.quality
    );
  });
}

/**
 * Renders an HTML element to a canvas using SVG serialization.
 */
async function renderHTMLElement(
  ctx: CanvasRenderingContext2D,
  element: HTMLElement,
  width: number,
  height: number
): Promise<void> {
  // Create SVG from HTML element
  const svgData = await htmlToSVG(element, width, height);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG for rendering'));
    };
    img.src = url;
  });
}

/**
 * Converts an HTML element to an SVG data URL.
 */
async function htmlToSVG(element: HTMLElement, width: number, height: number): Promise<string> {
  const clone = element.cloneNode(true) as HTMLElement;
  const styles = getComputedStyle(element);
  
  // Apply inline styles for key properties
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '-9999px';
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  
  document.body.appendChild(clone);
  
  // Get all computed styles to inline
  const allStyles = getAllStyles(element);
  
  document.body.removeChild(clone);
  
  // Serialize inner HTML
  const innerHTML = clone.outerHTML;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">
        ${innerHTML}
      </div>
    </foreignObject>
  </svg>`;
  
  return svg;
}

/**
 * Collects all computed styles from an element and its children.
 */
function getAllStyles(element: HTMLElement): string {
  const styles: string[] = [];
  
  function collectStyles(el: HTMLElement): void {
    const computed = getComputedStyle(el);
    const importantProps = [
      'background-color',
      'background',
      'color',
      'font-family',
      'font-size',
      'font-weight',
      'text-align',
      'padding',
      'margin',
      'border',
      'border-radius',
      'display',
      'flex',
      'flex-direction',
      'align-items',
      'justify-content',
      'gap',
      'width',
      'height',
      'box-sizing',
    ];
    
    const styleParts: string[] = [];
    for (const prop of importantProps) {
      const value = computed.getPropertyValue(prop);
      if (value && value !== 'auto' && value !== 'normal') {
        styleParts.push(`${prop}: ${value}`);
      }
    }
    
    if (styleParts.length > 0) {
      styles.push(`#${el.id || ''} { ${styleParts.join('; ')} }`);
    }
    
    // Process children
    Array.from(el.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        collectStyles(child);
      }
    });
  }
  
  collectStyles(element);
  return styles.join('\n');
}

/**
 * Triggers a download of the exported PNG.
 */
export function downloadPNG(blob: Blob, filename?: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? `export-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Complete export function that renders and downloads in one call.
 */
export async function exportAndDownloadPNG(
  element: CanvasRenderable | HTMLElement,
  options: PNGExportOptions = {}
): Promise<void> {
  const blob = await exportToPNG(element, options);
  const filename = (options.filename ?? 'export') + '.png';
  downloadPNG(blob, filename);
}

/**
 * Utility to convert canvas to data URL.
 */
export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality?: number
): string {
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Utility to create a thumbnail from a canvas.
 */
export function createThumbnail(
  canvas: HTMLCanvasElement,
  maxWidth: number,
  maxHeight: number
): HTMLCanvasElement {
  const aspectRatio = canvas.width / canvas.height;
  let thumbWidth = maxWidth;
  let thumbHeight = maxHeight;
  
  if (aspectRatio > maxWidth / maxHeight) {
    thumbHeight = maxWidth / aspectRatio;
  } else {
    thumbWidth = maxHeight * aspectRatio;
  }
  
  const thumb = createCanvas(thumbWidth, thumbHeight, 1);
  const ctx = thumb.getContext('2d');
  if (ctx) {
    ctx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
  }
  
  return thumb;
}
