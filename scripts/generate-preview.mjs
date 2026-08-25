/**
 * Genera public/preview.jpg (1200 x 630 px), la imagen de la tarjeta.
 *
 *   npm run generate:preview
 *
 * Estetica de publicacion social, con TU foto y TU nombre.
 * Sin logos, marcas ni dominios de terceros.
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
  /** Tu foto. Ponla en public/foto.jpg (cuadrada queda mejor). */
  photo: 'public/foto.jpg',
  /** Tu avatar. Opcional: si no existe, se dibuja un circulo con la inicial. */
  avatar: 'public/avatar.jpg',
  /** Tu nombre de usuario. USA EL TUYO, no el de otra persona. */
  handle: '@guilles',
  /** Linea pequena bajo el nombre */
  meta: 'hace 2 h',
  /** Pie de la publicacion */
  caption: 'Tengo algo para ti',
  /** Numero de "me gusta" que se muestra */
  likes: '128',
  /** Numero de comentarios */
  comments: '14',
};
/* =============================================================== */

const W = 1200;
const H = 630;
const PHOTO = 630; // la foto ocupa un cuadrado a la izquierda
const PANEL_X = PHOTO;
const PAD = 46;
const AV = 84;

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ENTITIES[c]);

/** Parte un texto en lineas de como mucho `max` caracteres. */
function wrap(text, max) {
  const out = [];
  let line = '';
  for (const word of String(text).split(/\s+/)) {
    if (!line) line = word;
    else if ((line + ' ' + word).length <= max) line += ' ' + word;
    else {
      out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  return out;
}

/* ---------- 1. La foto (o un degradado si aun no la has puesto) ---------- */
const photoPath = resolve(root, CONFIG.photo);
const hasPhoto = existsSync(photoPath);

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PHOTO}" height="${PHOTO}">
  <defs>
    <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3a2740"/>
      <stop offset="50%" stop-color="#241d33"/>
      <stop offset="100%" stop-color="#1b2a3d"/>
    </linearGradient>
  </defs>
  <rect width="${PHOTO}" height="${PHOTO}" fill="url(#p)"/>
  <g transform="translate(255 230)">
    <rect x="0" y="60" width="120" height="90" rx="10" fill="#2c2440" stroke="#ffffff" stroke-opacity="0.18"/>
    <rect x="-9" y="42" width="138" height="28" rx="9" fill="#352b4d" stroke="#ffffff" stroke-opacity="0.18"/>
    <rect x="51" y="42" width="18" height="108" fill="#ff8fb1" opacity="0.85"/>
  </g>
  <text x="50%" y="66%" text-anchor="middle" fill="#ffffff" fill-opacity="0.45"
        font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="22" letter-spacing="2">
    PON TU FOTO EN public/foto.jpg
  </text>
</svg>`;

const photoLayer = hasPhoto
  ? await sharp(photoPath)
      .resize(PHOTO, PHOTO, { fit: 'cover', position: 'attention' })
      .toBuffer()
  : await sharp(Buffer.from(placeholderSvg)).toBuffer();

/* ---------- 2. El avatar, recortado en circulo ---------- */
const avatarPath = resolve(root, CONFIG.avatar);
const initial = CONFIG.handle.replace(/^@/, '').charAt(0).toUpperCase() || '?';

const circleMask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${AV}" height="${AV}">
     <circle cx="${AV / 2}" cy="${AV / 2}" r="${AV / 2}" fill="#fff"/>
   </svg>`,
);

const avatarFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="${AV}" height="${AV}">
  <defs>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff8fb1"/>
      <stop offset="100%" stop-color="#8f9cff"/>
    </linearGradient>
  </defs>
  <circle cx="${AV / 2}" cy="${AV / 2}" r="${AV / 2}" fill="url(#a)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="Segoe UI, Helvetica, Arial, sans-serif"
        font-size="38" font-weight="700" fill="#14101a">${esc(initial)}</text>
</svg>`;

const avatarLayer = existsSync(avatarPath)
  ? await sharp(avatarPath)
      .resize(AV, AV, { fit: 'cover' })
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer()
  : await sharp(Buffer.from(avatarFallback)).png().toBuffer();

/* ---------- 3. El panel de la derecha ---------- */
const captionLines = wrap(CONFIG.caption, 22).slice(0, 4);
// El pie va primero y los "me gusta" debajo, como en un post.
const capY = 268;
const LINE = 54;
const statsY = capY + captionLines.length * LINE + 4;

const caption = captionLines
  .map(
    (l, i) =>
      `<text x="${PANEL_X + PAD}" y="${capY + i * LINE}" fill="#f4f1ea" font-size="42" ` +
      `font-weight="700" font-family="Georgia, Times New Roman, serif">${esc(l)}</text>`,
  )
  .join('\n    ');

const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#15121d"/>
      <stop offset="100%" stop-color="#0b0b10"/>
    </linearGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff8fb1"/>
      <stop offset="100%" stop-color="#8f9cff"/>
    </linearGradient>
  </defs>

  <rect x="${PANEL_X}" y="0" width="${W - PANEL_X}" height="${H}" fill="url(#panel)"/>
  <rect x="${PANEL_X - 26}" y="0" width="26" height="${H}" fill="#000000" fill-opacity="0.28"/>

  <g font-family="Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif">
    <circle cx="${PANEL_X + PAD + AV / 2}" cy="${PAD + 12 + AV / 2}" r="${AV / 2 + 5}"
            fill="none" stroke="url(#ring)" stroke-width="3"/>
    <text x="${PANEL_X + PAD + AV + 24}" y="${PAD + 46}" fill="#f4f1ea"
          font-size="30" font-weight="600">${esc(CONFIG.handle)}</text>
    <text x="${PANEL_X + PAD + AV + 24}" y="${PAD + 80}" fill="#7d7891"
          font-size="22">${esc(CONFIG.meta)}</text>

    <rect x="${PANEL_X + PAD}" y="196" width="${W - PANEL_X - PAD * 2}" height="1"
          fill="#ffffff" fill-opacity="0.09"/>

    ${caption}

    <g transform="translate(${PANEL_X + PAD} ${statsY})">
      <path d="M20 30 C 4 18, 4 4, 14 4 C 20 4, 20 10, 20 12 C 20 10, 20 4, 26 4 C 36 4, 36 18, 20 30 Z"
            fill="#ff8fb1"/>
      <text x="46" y="26" fill="#c9c4d8" font-size="24" font-weight="600">${esc(CONFIG.likes)}</text>
      <g transform="translate(130 0)">
        <path d="M4 6 h32 a4 4 0 0 1 4 4 v14 a4 4 0 0 1 -4 4 h-20 l-10 8 v-8 h-2 a4 4 0 0 1 -4 -4 v-14 a4 4 0 0 1 4 -4 z"
              fill="none" stroke="#8f9cff" stroke-width="3" stroke-linejoin="round"/>
        <text x="54" y="26" fill="#c9c4d8" font-size="24" font-weight="600">${esc(CONFIG.comments)}</text>
      </g>
    </g>

    <text x="${PANEL_X + PAD}" y="${H - PAD - 4}" fill="#5f5b70" font-size="19" letter-spacing="2">
      WEB HECHA A MANO · NO ES UNA RED SOCIAL
    </text>
  </g>
</svg>`;

/* ---------- 4. Montaje ---------- */
const buffer = await sharp({
  create: { width: W, height: H, channels: 3, background: '#0b0b10' },
})
  .composite([
    { input: photoLayer, top: 0, left: 0 },
    { input: Buffer.from(overlay), top: 0, left: 0 },
    { input: avatarLayer, top: PAD + 12, left: PANEL_X + PAD },
  ])
  .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
  .toBuffer();

const OUT = resolve(root, 'public', 'preview.jpg');
writeFileSync(OUT, buffer);

console.log(`\n  preview.jpg generado (${W} x ${H} px, ${(buffer.length / 1024).toFixed(0)} KB)`);
console.log(
  hasPhoto
    ? `  Foto: ${CONFIG.photo}`
    : `  SIN FOTO -> pon la tuya en ${CONFIG.photo} y vuelve a ejecutar el script`,
);
console.log(
  existsSync(avatarPath)
    ? `  Avatar: ${CONFIG.avatar}\n`
    : `  Avatar: circulo generado con la inicial de ${CONFIG.handle}\n`,
);
