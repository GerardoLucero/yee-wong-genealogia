# ART: direccion de arte del santuario

## Variables estables (contrato con los demas agentes)
Definidas en `css/tokens.css`. No renombrar.

- Color: `--lacquer --lacquer-2 --lacquer-3 --cinnabar --cinnabar-deep --gold --gold-bright --gold-dim --ink --ink-2 --paper --paper-dim --jade --jade-deep --fog --fog-strong --hypothesis --line --bg --fg`
- Fuentes: `--font-serif --font-cjk --font-brush --font-ui`
- Tipo fluido: `--fs-xs --fs-sm --fs-base --fs-md --fs-lg --fs-xl --fs-2xl --fs-han`, `--lh-tight --lh-base --lh-loose`, `--tracking-wide`, `--measure`
- Espacio: `--gutter --sp-1..--sp-9 --radius`
- Tiempo/easing: `--dur-fast --dur-base --dur-slow --dur-reveal --dur-epic`, `--ease-ink --ease-silk --ease-out --ease-breath`
- Capas: `--z-bg --z-layer-far --z-layer-mid --z-layer-near --z-content --z-fog --z-grain --z-chrome --z-menu --z-modal`
- Efectos: `--glow-gold --glow-red --glow-jade --glow-porcelain --glow-lantern`, degradados `--grad-*`, acentos `--accent*`, nuevos `--red-china --red-china-deep --rice --jade-soft --porcelain --porcelain-bright`

## Clases de base.css
`.act` `.act-inner` `.act-title` `.act-copy` `.layer` (`.layer-far/-mid/-near`) `.motif` (+ `.motif-gold/-ink/-cinnabar/-jade`) `.reveal` (+ `.reveal-blur`, `.is-in`; el JS pone `html.reveal-ready`) `.stroke-draw` (+ `--len`, `.is-in`) `.seal` (+ `.seal--confirmed`, `.seal--hypothesis`, `.seal--pending`) `.hypothesis-text` `.film-grain` `.vignette` `.fog` (+ `.fog--top/--bottom`) `.rule-gold` `.han` `.han-big` `.han-ghost` `.brush` `.eyebrow` `.lead` `.muted` `.sr-only` `.skip-link`.

Uso de sprite: `<svg class="motif motif-gold" aria-hidden="true"><use href="img/motifs.svg#m-farol"/></svg>`. Para tamano, dar width/height al svg (el sprite usa viewBox propio). `m-sello` usa `fill` (color actual), el resto usa trazo `currentColor`. Si `<use>` externo falla en `file://`, el Motor puede inyectar el sprite inline.

## Paleta (china viva, fondo oscuro, color intenso en sellos, faroles, titulos y bordes de oro)
| Token | Hex | Uso |
|---|---|---|
| lacquer / -2 / -3 | #120a0a / #1d0f10 / #2e1517 | fondos y superficies |
| red-china / -deep | #C8102E / #8f0b20 | rojo chino: acento acto 7 y degradados |
| cinnabar / -deep | #E34234 / #a82a1f | rojo cinabrio: sellos, faroles |
| gold | #D4AF37 | oro imperial: bordes, trazos |
| gold-bright | #F7C948 | amarillo imperial: brillo, titulos |
| gold-dim | #9a7d24 | oro apagado, contornos |
| ink / ink-2 | #0b0b0d / #1a1c22 | negro tinta |
| paper (=rice) / paper-dim | #F8F4E6 / #c4b9a2 | blanco arroz, texto |
| jade / -deep / -soft | #00A86B / #006e47 / #4fd1a0 | jade (soft para texto) |
| porcelain / -bright | #1F4E8C / #5b8fd6 | azul porcelana (bright para texto y trazo) |
| hypothesis | #8fb8ee | todo lo "por confirmar" |

Degradados: `--grad-red-gold --grad-gold --grad-gold-text --grad-lacquer --grad-jade --grad-porcelain`.
Brillos: `--glow-gold --glow-red --glow-jade --glow-porcelain --glow-lantern`.
Acentos por acto: `--accent-1..7` y `--accent-1b..7b`. Dentro de `.act[data-act="N"]` ya estan fijados `--accent` y `--accent-2nd`; usar esos dos en el CSS de cada acto y el color cambia solo.
Contraste: paper sobre lacquer ~15:1; gold ~8:1; porcelain (#1F4E8C) NO como texto sobre oscuro, usar porcelain-bright.

## Utilidades de color y keyframes (base.css)
Clases: `.text-gold` (texto con degradado; combinar con `.anim-shimmer`), `.text-accent`, `.border-gold`, `.border-accent`, `.bg-red-gold`, `.glow-gold`, `.glow-red`, `.rule-red-gold`, `.lantern-glow`, `.ink-blot`, `.ripple-ring`.
Keyframes y clase: `float` `.anim-float`; `candle-flicker` `.anim-candle`; `gold-shimmer` `.anim-shimmer`; `gold-glow` `.anim-glow`; `ripple` `.anim-ripple` (con `.ripple-ring`, varios con animation-delay); `ink-spread` `.anim-ink` (con `.ink-blot`); `lantern-sway` `.anim-sway` (origen arriba). Todos se apagan con reduced-motion.

## Fuentes (Google Fonts)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Serif+SC:wght@500;700&family=Ma+Shan+Zheng&display=swap" rel="stylesheet">
```
Cormorant Garamond: texto y titulos latinos. Noto Serif SC: todo caracter chino. Ma Shan Zheng: trazo de pincel solo para 1 o 2 caracteres por acto (acentos), nunca parrafos. Solo usar caracteres de FACTS.md.

## Reglas de movimiento por tipo
- Tinta (titulos, caracteres): aparece con opacity + blur 8px a 0, 1.4s, `--ease-ink`; nunca rebota.
- Trazos SVG (montanas, olas, bambu, ciruelo): `.stroke-draw`, 2.4s `--ease-silk`, ligado a scroll con scrub.
- Parallax: `.layer-far` mueve 10%, mid 25%, near 45% del desplazamiento; solo translate3d.
- Niebla: deriva lenta (38s) y se espesa en transiciones entre actos.
- Luz (faroles, incienso): respiracion 4-6s con `--ease-breath`, opacidad 0.7 a 1; humo con trazo animado.
- Texto: entra por bloques, nunca letra por letra; 24px de subida maxima.
- Particulas (ceniza, petalos, brasas): maximo 60, canvas o SVG, 20-40 px/s.
- Cada acto: un solo momento memorable; el resto es quietud. Pausas largas son parte del ritmo.
- `prefers-reduced-motion`: todo estatico y visible, sin grano animado ni niebla.
- Sellos: se estampan con scale 1.15 a 1 + opacity en 300ms (unico movimiento "con peso").

## Simbolos por acto
| Acto | Tema | Motivo principal | Secundario | Color dominante |
|---|---|---|---|---|
| 1 Umbral | puerta, entrada | `m-celosia` (ventana que se abre) + `m-xiangyun` | caracter 余 gigante | lacquer + gold-bright + red-china |
| 2 Aldea | Taishan, origen | `m-montana` + `m-bambu` | `m-xiangyun` en niebla, sello hipotesis (aldea por confirmar) | ink + jade-soft + gold |
| 3 Travesia | cruce del mar | `m-olas` | `m-moneda`, `m-xiangyun` bajo | ink + porcelain-bright + gold-bright |
| 4 Mexico | Mulege, BCS | `m-farol` | `m-sello`, `m-ciruelo` (raiz que se planta) | lacquer + cinnabar + gold |
| 5 Arbol | ramas, generaciones | `m-ciruelo` (el arbol mismo) | 礼 como `.han-ghost`, `m-bambu` | lacquer-2 + gold + jade-soft |
| 6 Investigacion | preguntas abiertas | `m-celosia` + `m-incienso` (humo = incertidumbre) | `.seal--hypothesis`, `.seal--pending` | ink-2 + hypothesis + gold-bright |
| 7 Altar | cierre, puerta abierta | `m-incienso` + `m-farol` (dos faroles) | `m-sello`, `m-celosia` abierta | lacquer + red-china + gold-bright |
