/**
 * ---------------------------------------------------------------
 *  AQUI SE EDITA TODO EL TEXTO DE LA PREVIEW (WhatsApp / Twitter)
 * ---------------------------------------------------------------
 * La URL base NO se toca aqui: se define con SITE_URL y BASE_PATH
 * en el .env (o en el workflow de GitHub Pages).
 */
export const preview = {
  /** Titulo grande de la tarjeta */
  title: 'Tengo algo para ti 👀',
  /** Texto secundario de la tarjeta */
  description: 'Abre esto cuando estés preparado/a 🎂',
  /** Ruta de la imagen dentro de /public (1200 x 630 px) */
  image: '/preview.jpg',
  /** Texto alternativo de la imagen */
  imageAlt: 'Una sorpresa te espera',
  /** Ancho/alto reales del archivo de imagen */
  imageWidth: 1200,
  imageHeight: 630,
} as const;

export const site = {
  /** Nombre del sitio (aparece en og:site_name) */
  name: 'Una sorpresa para ti',
  /** Idioma del documento */
  lang: 'es',
  /** Ruta a la que redirige /sorpresa (sin la base del repo) */
  destination: '/viewer',
  /** Milisegundos que se muestra la pantalla de espera antes de redirigir */
  redirectDelayMs: 1000,
} as const;

/**
 * Antepone la base del sitio a una ruta absoluta.
 *
 * En local  -> withBase('/viewer') === '/viewer'
 * En Pages  -> withBase('/viewer') === '/nombre-del-repo/viewer'
 *
 * Usalo SIEMPRE que escribas una ruta propia (enlaces, imagenes, redirects):
 * si no, al desplegar en GitHub Pages apuntarian a la raiz del dominio y darian 404.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '')}`;
}

/**
 * Origen a usar para construir URLs absolutas.
 *
 * En `npm run dev` devuelve el origen REAL de la peticion (el puerto puede
 * cambiar si el 4321 esta ocupado, o ser la IP de tu movil en la red local),
 * asi que la preview funciona en local sin tocar nada.
 * En `npm run build` usa SITE_URL, que es la URL definitiva del sitio.
 */
export function resolveOrigin(currentUrl: URL, configuredSite: URL | undefined): URL {
  if (import.meta.env.DEV) return new URL(currentUrl.origin);
  return configuredSite ?? new URL(currentUrl.origin);
}
