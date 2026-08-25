// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

// Variables de .env (local). En GitHub Actions llegan por process.env.
const fileEnv = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

/**
 * SITE_URL  -> origen del sitio, SIN la ruta del repo.
 *              GitHub Pages de proyecto: https://TU-USUARIO.github.io
 *              Dominio propio:           https://mi-dominio.com
 * BASE_PATH -> subcarpeta donde vive el sitio.
 *              GitHub Pages de proyecto: /nombre-del-repo
 *              Dominio propio o repo TU-USUARIO.github.io: vacio
 *
 * En local no hace falta tocar nada: por defecto http://localhost:4321 sin base.
 * El workflow de GitHub los calcula solo a partir del repositorio.
 */
const SITE_URL = process.env.SITE_URL || fileEnv.SITE_URL || 'http://localhost:4321';
const BASE_PATH = process.env.BASE_PATH ?? fileEnv.BASE_PATH ?? '';

// Normaliza: '' | '/repo' (sin barra final)
const base = BASE_PATH.trim().replace(/\/+$/, '');

// Aviso util en Windows: Git Bash convierte `BASE_PATH=/repo` en una ruta
// tipo `C:/Program Files/Git/repo`. Si eso pasara, el sitio se desplegaria
// con enlaces rotos, asi que preferimos fallar aqui.
if (base && !/^\/[A-Za-z0-9._-]+$/.test(base)) {
  throw new Error(
    `BASE_PATH invalido: "${BASE_PATH}". Debe ser vacio o "/nombre-del-repo".
` +
      'Si lo has puesto en linea desde Git Bash, ponlo en el archivo .env en su lugar.',
  );
}

export default defineConfig({
  site: SITE_URL,
  base: base || undefined,
  // 'never' + format 'file' => GitHub Pages sirve /sorpresa directamente,
  // sin el 301 a /sorpresa/ que anade una redireccion extra para el crawler.
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
