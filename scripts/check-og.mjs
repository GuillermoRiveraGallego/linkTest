/**
 * Comprueba las etiquetas Open Graph como lo haria el crawler de WhatsApp.
 *
 *   npm run check:og                       -> contra el dev server local
 *   npm run check:og -- https://x.io/y     -> contra la URL desplegada
 *
 * No ejecuta JavaScript, igual que el bot real: si algo falta aqui,
 * tampoco aparecera en WhatsApp.
 */
const target = process.argv[2] ?? 'http://localhost:4321/sorpresa';
const UA = 'WhatsApp/2.23.20.0 A';

const REQUIRED = [
  'og:title',
  'og:description',
  'og:image',
  'og:type',
  'og:url',
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
];

function tag(html, name) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']|` +
      `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${name}["']`,
    'i',
  );
  const m = html.match(re);
  return m ? (m[1] ?? m[2]) : null;
}

let res;
try {
  res = await fetch(target, { headers: { 'user-agent': UA }, redirect: 'follow' });
} catch {
  console.error(`\n  No se pudo conectar con ${target}`);
  console.error('  ¿Está arrancado `npm run dev`? Mira en qué puerto lo dice la consola.\n');
  process.exit(1);
}

const html = await res.text();
console.log(`\n  Analizando ${res.url}  (HTTP ${res.status}, ${html.length} bytes)\n`);

let failed = 0;
for (const name of REQUIRED) {
  const value = tag(html, name);
  if (value) {
    console.log(`  [ OK ]  ${name.padEnd(22)} ${value}`);
  } else {
    failed++;
    console.log(`  [FALTA] ${name}`);
  }
}

// La imagen tiene que existir y ser accesible sin cookies ni login.
const img = tag(html, 'og:image');
if (img) {
  if (!/^https?:\/\//i.test(img)) {
    failed++;
    console.log(`\n  [FALLO] og:image no es una URL absoluta: ${img}`);
  } else {
    try {
      const r = await fetch(img, { headers: { 'user-agent': UA } });
      const type = r.headers.get('content-type') ?? '?';
      const size = (await r.arrayBuffer()).byteLength;
      const ok = r.ok && type.startsWith('image/');
      if (!ok) failed++;
      console.log(
        `\n  [${ok ? ' OK ' : 'FALLO'}]  imagen accesible  HTTP ${r.status}, ${type}, ${(size / 1024).toFixed(0)} KB`,
      );
    } catch {
      failed++;
      console.log(`\n  [FALLO] no se pudo descargar og:image (${img})`);
    }
  }
}

// Aviso: el crawler real nunca alcanza localhost.
const host = new URL(res.url).host;
if (/^(localhost|127\.0\.0\.1|\[::1\])/.test(host)) {
  console.log(
    `\n  Nota: ${host} solo existe en tu ordenador. Las etiquetas son correctas,\n` +
      '  pero WhatsApp no podrá verlas hasta que el sitio esté publicado en GitHub Pages.',
  );
}

console.log(failed === 0 ? '\n  Todo correcto.\n' : `\n  ${failed} problema(s).\n`);
process.exit(failed === 0 ? 0 : 1);
