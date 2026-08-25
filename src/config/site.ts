/**
 * ---------------------------------------------------------------
 *  AQUI SE EDITA TODO EL TEXTO DE LA PREVIEW (WhatsApp / Twitter)
 * ---------------------------------------------------------------
 * La URL base NO se toca aqui: se define con SITE_URL en el .env
 * y se lee desde astro.config.mjs (Astro.site).
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
  /** Ruta a la que redirige /sorpresa */
  destination: '/viewer',
  /** Milisegundos que se muestra la pantalla de espera antes de redirigir */
  redirectDelayMs: 1000,
} as const;
