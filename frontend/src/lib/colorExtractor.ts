// ============================================================================
// RYMEC ReClaim-iT: Photo-First Canvas Dominant Colour Extractor (U7)
// ============================================================================

const PALETTE: { name: string; r: number; g: number; b: number }[] = [
  { name: 'Black', r: 25, g: 25, b: 25 },
  { name: 'Silver/Grey', r: 180, g: 180, b: 185 },
  { name: 'White', r: 245, g: 245, b: 245 },
  { name: 'Blue', r: 35, g: 85, b: 195 },
  { name: 'Navy Blue', r: 15, g: 30, b: 80 },
  { name: 'Red', r: 210, g: 40, b: 45 },
  { name: 'Brown', r: 120, g: 70, b: 35 },
  { name: 'Green', r: 40, g: 150, b: 70 },
  { name: 'Yellow', r: 235, g: 200, b: 40 },
  { name: 'Gold', r: 215, g: 170, b: 50 },
  { name: 'Pink', r: 235, g: 110, b: 160 },
  { name: 'Purple/Violet', r: 130, g: 65, b: 185 },
  { name: 'Orange', r: 235, g: 120, b: 35 }
];

export async function extractDominantColor(fileOrUrl: File | string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve('Black');
        }

        // Downscale to 50x50 as specified in U7
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        const imgData = ctx.getImageData(0, 0, 50, 50);
        const data = imgData.data;

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a > 128) {
            // Ignore near-white backgrounds if high contrast
            totalR += r;
            totalG += g;
            totalB += b;
            count++;
          }
        }

        if (count === 0) return resolve('Black');

        const avgR = totalR / count;
        const avgG = totalG / count;
        const avgB = totalB / count;

        // Find nearest palette match
        let bestColor = 'Black';
        let minDistance = Infinity;

        for (const item of PALETTE) {
          const dist = Math.sqrt(
            Math.pow(avgR - item.r, 2) +
            Math.pow(avgG - item.g, 2) +
            Math.pow(avgB - item.b, 2)
          );
          if (dist < minDistance) {
            minDistance = dist;
            bestColor = item.name;
          }
        }

        resolve(bestColor);
      } catch (err) {
        console.error('Color extraction failed:', err);
        resolve('Black');
      }
    };

    img.onerror = () => {
      resolve('Black');
    };

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      img.src = URL.createObjectURL(fileOrUrl);
    }
  });
}
