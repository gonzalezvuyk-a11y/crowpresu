# The Crow Design System

Este archivo resume el design system actual del proyecto para compartirlo con otro modelo o colaborador.

## Identidad

- Nombre: `The Crow`
- Estilo: editorial, monocromo, técnico, sobrio, document-first
- Sensación buscada: una pieza impresa precisa traducida a software
- Prioridad visual: jerarquía por tipografía, espaciado, bordes y contraste; no por color decorativo

## Principios

- Mantener la interfaz contenida, silenciosa y legible.
- Usar color con mucha moderación.
- Preferir bordes, reglas y superficies a sombras o efectos.
- Favorecer layouts apilados y compactos.
- Mantener radios mínimos y geometría nítida.
- Evitar adornos, gradientes llamativos y motion innecesario.

## Paleta

### Colores base

- `ink`: `#0D0D0D` — texto principal, titulares, bordes fuertes, acciones principales
- `muted`: `#8A8A8A` — metadata, labels, texto secundario
- `inverse`: `#FCFCFB` — texto invertido sobre fondos oscuros
- `surface-document`: `#FCFCFB` — hoja/documento principal
- `surface-app`: `#F0F0F1` — fondo general de app
- `surface-panel`: `#F5F4F1` — paneles y zonas auxiliares
- `surface-card`: `rgba(255, 255, 255, 0.45)` — tarjetas y capas suaves
- `rule-soft`: `rgba(13, 13, 13, 0.12)` — separadores suaves
- `rule-strong`: `rgba(13, 13, 13, 0.15)` — separadores más enfáticos
- `border-soft`: `rgba(13, 13, 13, 0.13)` — bordes por defecto

### Uso

- Contraste alto para contenido principal.
- Grises y superficies papel para estructura.
- Sin colores acento salvo que haya una razón funcional fuerte.

## Tipografía

### Familias

- Body: `"TT Norms Pro Trial", "Helvetica Neue", Arial, sans-serif`
- Mono/UI: `"TT Norms Pro Mono Trl", "SFMono-Regular", Consolas, monospace`

### Escalas principales

- `display`: `32px`
- `price`: `16px`
- `input`: `11px`
- `field`: `10.5px`
- `body`: `10px`
- `button`: `9px`
- `ui`: `8.5px`
- `label`: `8px`
- `small`: `7.5px`
- `tiny`: `7px`
- `micro-plus`: `6.5px`
- `micro`: `6px`

### Tracking

- `wide`: `0.04em`
- `ui`: `0.06em`
- `label`: `0.08em`
- `meta`: `0.10em`
- `strong`: `0.12em`
- `heading`: `0.14em`
- `title`: `0.16em`
- `section`: `0.20em`
- `brand-ui`: `0.22em`
- `brand-doc`: `0.26em`

### Line height

- `body`: `1.5`
- `relaxed`: `1.6`
- `doc`: `1.85`

### Reglas de uso

- Texto mayormente alineado a la izquierda.
- Labels y metadata en mayúsculas con tracking generoso.
- La jerarquía debe venir más por peso, tamaño y espaciado que por color.
- El cuerpo es compacto pero muy legible.

## Espaciado y forma

### Radios

- `xs`: `1px`
- `sm`: `2px`

### Espaciados más usados

- `4px`, `8px`, `9px`, `14px`, `16px`, `18px`, `22px`, `24px`, `28px`, `32px`, `40px`, `52px`, `80px`, `108px`

### Reglas de layout

- Ritmo vertical denso.
- Separaciones frecuentes con reglas suaves.
- Padding grande reservado para documento principal.
- Paneles y builders diferenciados por superficie y borde, no por ornamento.

## Componentes

### Botón primario

- Fondo: `ink`
- Texto: `inverse`
- Padding: `8px 14px`
- Radius: `2px`
- Uso: acción principal única y clara

### Botón secundario

- Fondo: `transparent`
- Texto: `muted`
- Borde: `border-soft`
- Padding vertical: `8px`
- Margin top típico: `9px`
- Radius: `2px`

### Chip default

- Texto: `muted`
- Borde: `border-soft`
- Radius: `2px`

### Chip activo

- Fondo: `ink`
- Texto: `inverse`
- Borde: `ink`

### Field

- Label: `muted`, margen inferior `4px`
- Input: texto `ink`, borde inferior/sutil `border-soft`
- Padding vertical: `4px` arriba, `6px` abajo
- Estética mínima, sin chrome innecesario

### Card

- Superficie: `surface-card`
- Borde: `border-soft`
- Radius: `2px`

### Document sheet

- Fondo: `surface-document`
- Padding: `52px`
- Es el contenedor principal del output o presupuesto

## Voz visual

- Monocromo primero.
- Editorial antes que marketing.
- Técnico antes que decorativo.
- Compacto antes que espacioso.
- Preciso antes que expresivo.

## Qué sí hacer

- Usar bordes finos y superficies cálidas.
- Mantener componentes visualmente callados hasta que el estado los destaque.
- Construir jerarquía con tipo, espacio y alineación.
- Hacer que todo se sienta “ingenierizado”.

## Qué no hacer

- No meter colores vibrantes por estética.
- No usar esquinas redondeadas grandes.
- No abusar de sombras, blur o gradientes.
- No hacer layouts aireados o “marketing-like”.
- No introducir motion decorativo.

## Fuentes de verdad en el repo

- Resumen narrativo: `/Users/brunogonzalez/Documents/crow presu - claude/DESIGN.md`
- Tokens fuente: `/Users/brunogonzalez/Documents/crow presu - claude/tokens.json`
- CSS generado: `/Users/brunogonzalez/Documents/crow presu - claude/design-system.css`

## Prompt corto para otro modelo

Si necesitás pasárselo a Claude como instrucción compacta, podés usar esto:

> Usá un design system llamado "The Crow": monocromo, editorial, técnico y document-first. Priorizá jerarquía por tipografía, espaciado, bordes y contraste; no por color decorativo. Paleta principal: ink `#0D0D0D`, muted `#8A8A8A`, surface-document `#FCFCFB`, surface-app `#F0F0F1`, surface-panel `#F5F4F1`, bordes suaves en `rgba(13,13,13,0.13)`. Tipografía body con TT Norms Pro Trial y UI con TT Norms Pro Mono Trl. Escala compacta: body `10px`, input `11px`, button `9px`, labels `8px`, tracking amplio en labels y headings. Radios mínimos de `1px` a `2px`. Preferir bordes, reglas y superficies suaves sobre sombras. El resultado debe sentirse preciso, sobrio, compacto y funcional, como un documento impreso traducido a software.
