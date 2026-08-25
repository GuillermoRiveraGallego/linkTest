# Sorpresa de cumpleaños

Web estática (Astro + TypeScript + CSS plano) pensada para compartir por WhatsApp
y desplegar en **GitHub Pages**.

## Rutas

| Ruta        | Qué hace                                                                    |
|-------------|-----------------------------------------------------------------------------|
| `/sorpresa` | **La única página.** Metadatos Open Graph, espera ~1 s y revela la sorpresa. |
| `/`         | Portada neutra a propósito: no destripa nada si recortan la URL.             |
| `/debug`    | Herramienta local. En el sitio publicado no muestra nada.                    |

No existe ninguna otra URL: la felicitación vive dentro de `/sorpresa` y se
descubre ahí mismo, así que nadie puede llegar a ella adivinando una dirección.

## Probar en local

```bash
npm install
npm run dev
```

La consola dice el puerto (normalmente `http://localhost:4321`; si está ocupado,
Astro elige otro y lo indica). Abre:

- `/debug` → ves la tarjeta tal y como quedará al compartir el enlace
- `/sorpresa` → la pantalla de espera y, al segundo, la sorpresa

Comprobar los metadatos como lo hace el bot de WhatsApp (con `npm run dev` abierto):

```bash
npm run check:og                                  # puerto 4321
npm run check:og -- http://localhost:4325/sorpresa  # otro puerto
```

Verlo en el móvil dentro de tu wifi:

```bash
npm run dev -- --host
```

## Desplegar en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub (rama `main`).
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada `git push` a `main` despliega solo mediante `.github/workflows/deploy.yml`.

El workflow calcula la URL solo; **no hay que configurar nada a mano**:

| Caso                                 | URL resultante                                   |
|--------------------------------------|--------------------------------------------------|
| Repo normal, p. ej. `sorpresa-cumple` | `https://TU-USUARIO.github.io/sorpresa-cumple/sorpresa` |
| Repo `TU-USUARIO.github.io`           | `https://TU-USUARIO.github.io/sorpresa`          |
| Dominio propio (crea `public/CNAME`)  | `https://mi-dominio.com/sorpresa`                |

Al terminar el workflow, la URL aparece en la pestaña **Actions** y en **Settings → Pages**.

Comprobar el despliegue real:

```bash
npm run check:og -- https://TU-USUARIO.github.io/TU-REPO/sorpresa
```

## Dónde tocar cada cosa

| Quiero cambiar…                   | Archivo                                    |
|-----------------------------------|--------------------------------------------|
| Título/descripción de la preview  | `src/config/site.ts` → `preview`           |
| La foto de la tarjeta             | `public/foto.jpg` + `npm run generate:preview` |
| Recorte de la foto                | `scripts/generate-preview.mjs` → `CONFIG.fit` |
| Textos de la sorpresa             | `src/pages/sorpresa.astro` (arriba del todo) |
| Retardo antes de revelar          | `src/config/site.ts` → `revealDelayMs`     |
| URL de producción                 | nada: la calcula el workflow               |

Regenerar la imagen de la tarjeta: `npm run generate:preview`.

## Notas técnicas

- `/sorpresa` no redirige a ninguna parte: el HTML se sirve entero con los
  metadatos Open Graph para que el crawler de WhatsApp los lea, y la sorpresa
  se revela en la misma página con JavaScript. Los crawlers no ejecutan JS, así
  que leen la tarjeta sin llegar a "abrir" nada.
- Sin JavaScript la sorpresa se ve directamente, sin espera (clase `no-js`).
- `public/robots.txt` pide a los buscadores que no indexen el sitio.
- En GitHub Pages de proyecto el sitio vive en `/nombre-del-repo`. Por eso toda
  ruta interna pasa por `withBase()` de `src/config/site.ts`. **Si añades enlaces
  o imágenes nuevas, usa `withBase('/lo-que-sea')`**, no `/lo-que-sea` a secas.
- `build.format: 'file'` genera `sorpresa.html`, así GitHub Pages sirve
  `/sorpresa` sin una redirección 301 intermedia.
- `public/.nojekyll` evita que GitHub ignore la carpeta `_astro/`.
- No se usan logos ni dominios de terceros: la tarjeta es de diseño propio.
