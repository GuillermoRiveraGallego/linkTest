/**
 * Genera public/preview.jpg (1200 x 630 px), la imagen de la tarjeta.
 *
 *   npm run generate:preview
 *
 * La tarjeta es SOLO tu foto: sin texto, sin panel, sin marcas.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

/* ===============================================================
   CONFIGURA AQUI LA TARJETA
   =============================================================== */
const CONFIG = {
  /** Tu foto. Ponla en public/foto.jpg */
  photo: 'public/foto.jpg',

  /**
   * Como encajar la foto en el formato 1200 x 630:
   *
   *   'cover' -> la recorta para llenar el marco. Sin bordes, pero
   *              se pierde parte de arriba y de abajo.
   *   'blur'  -> se ve la foto ENTERA, y el hueco que sobra se
   *              rellena con la misma foto ampliada y desenfocada.
   */
  fit: 'cover',

  /**
   * Solo para fit: 'cover'. Que parte de la foto se conserva al recortar:
   *   'attention' (la zona con mas detalle), 'entropy',
   *   'centre', 'top', 'bottom', 'left', 'right'
   */
  crop: 'attention',
};
/* =============================================================== */

const W = 1200;
const H = 630;

const photoPath = resolve(root, CONFIG.photo);
const OUT = resolve(root, 'public', 'preview.jpg');

/* ---------- Si aun no hay foto, un marcador discreto ---------- */
if (!existsSync(photoPath)) {
  const placeholder = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3a2740"/>
        <stop offset="50%" stop-color="#241d33"/>
        <stop offset="100%" stop-color="#1b2a3d"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#p)"/>
    <text x="50%" y="52%" text-anchor="middle" fill="#ffffff" fill-opacity="0.5"
          font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" letter-spacing="2">
      PON TU FOTO EN ${CONFIG.photo}
    </text>
  </svg>`;

  const buf = await sharp(Buffer.from(placeholder))
    .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
    .toBuffer();
  writeFileSync(OUT, buf);
  console.log(`\n  SIN FOTO -> pon la tuya en ${CONFIG.photo} y vuelve a ejecutar el script\n`);
  process.exit(0);
}

/* ---------- La foto, y nada mas ---------- */
let image;

if (CONFIG.fit === 'blur') {
  // Fondo: la propia foto ampliada y desenfocada. Encima, la foto entera.
  const background = await sharp(photoPath)
    .resize(W, H, { fit: 'cover' })
    .blur(42)
    .modulate({ brightness: 0.6 })
    .toBuffer();

  const foreground = await sharp(photoPath).resize(W, H, { fit: 'inside' }).toBuffer();

  image = sharp(background).composite([{ input: foreground, gravity: 'center' }]);
} else {
  image = sharp(photoPath).resize(W, H, { fit: 'cover', position: CONFIG.crop });
}

const buffer = await image.jpeg({ quality: 88, chromaSubsampling: '4:4:4' }).toBuffer();
writeFileSync(OUT, buffer);

const meta = await sharp(photoPath).metadata();
console.log(`\n  preview.jpg generado (${W} x ${H} px, ${(buffer.length / 1024).toFixed(0)} KB)`);
console.log(`  Origen: ${CONFIG.photo} (${meta.width} x ${meta.height} px)`);
console.log(`  Encaje: ${CONFIG.fit}${CONFIG.fit === 'cover' ? ` / ${CONFIG.crop}` : ''}\n`);
