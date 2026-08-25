/**
 * Genera public/preview.jpg (1200 x 630 px) a partir de un SVG.
 *
 *   npm run generate:preview
 *
 * Es un placeholder con estetica de tarjeta social propia:
 * sin logos de terceros y con el nombre del sitio bien visible.
 * Sustituyelo por tu propia imagen cuando quieras (mismas dimensiones).
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'public', 'preview.jpg');

const W = 1200;
const H = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#12101c"/>
      <stop offset="55%" stop-color="#0b0b10"/>
      <stop offset="100%" stop-color="#191225"/>
    </linearGradient>
    <radialGradient id="glowA" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff8fb1" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ff8fb1" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8f9cff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#8f9cff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff8fb1"/>
      <stop offset="100%" stop-color="#8f9cff"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="230" cy="120" rx="420" ry="320" fill="url(#glowA)"/>
  <ellipse cx="1010" cy="540" rx="440" ry="330" fill="url(#glowB)"/>

  <!-- marco sutil -->
  <rect x="36" y="36" width="${W - 72}" height="${H - 72}" rx="34"
        fill="none" stroke="#ffffff" stroke-opacity="0.10" stroke-width="2"/>

  <!-- regalo (ilustracion propia, sin logos de terceros) -->
  <g transform="translate(150 210)">
    <rect x="0" y="70" width="200" height="150" rx="16" fill="#1b1826" stroke="#ffffff" stroke-opacity="0.14"/>
    <rect x="-14" y="42" width="228" height="44" rx="14" fill="#221d31" stroke="#ffffff" stroke-opacity="0.14"/>
    <rect x="86" y="42" width="28" height="178" fill="url(#ribbon)" opacity="0.95"/>
    <path d="M100 44 C 60 44, 44 6, 78 4 C 100 3, 100 30, 100 44 Z" fill="url(#ribbon)"/>
    <path d="M100 44 C 140 44, 156 6, 122 4 C 100 3, 100 30, 100 44 Z" fill="url(#ribbon)"/>
  </g>

  <!-- chispas -->
  <g fill="#ffffff" opacity="0.55">
    <circle cx="430" cy="150" r="3"/>
    <circle cx="392" cy="470" r="2.5"/>
    <circle cx="1090" cy="180" r="3"/>
    <circle cx="960" cy="120" r="2"/>
    <circle cx="700" cy="560" r="2.5"/>
  </g>

  <g font-family="Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif">
    <text x="430" y="228" fill="#ff8fb1" font-size="24" letter-spacing="6" font-weight="600">
      UNA SORPRESA PARA TI
    </text>
    <text x="430" y="322" fill="#f4f1ea" font-size="74" font-weight="700"
          font-family="Georgia, Times New Roman, serif">
      Tengo algo para ti
    </text>
    <text x="430" y="388" fill="#a9a4b8" font-size="34">
      Abre esto cuando estés preparado/a
    </text>
    <text x="430" y="486" fill="#6f6a80" font-size="22" letter-spacing="3">
      HECHO A MANO · WEB PROPIA · NO ES UNA RED SOCIAL
    </text>
  </g>
</svg>`;

const buffer = await sharp(Buffer.from(svg))
  .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
  .toBuffer();

writeFileSync(OUT, buffer);
console.log(`preview.jpg generado: ${OUT} (${W} x ${H} px, ${(buffer.length / 1024).toFixed(0)} KB)`);
