# Tokens — taxonomia, nomes e formatos

## Camadas
1. **Primitivos** (valor cru): `blue-500: #4da3ff`, `space-4: 16px`.
2. **Semânticos** (papel): `color-accent`, `color-text`, `color-surface`, `space-component-gap` → apontam para primitivos. **Componentes usam semânticos.**
3. **De componente** (opcional): `button-radius`, `card-padding` → apontam para semânticos. Só quando a variação por componente é real.
Tema claro/escuro troca a camada semântica, não os componentes.

## Categorias e escalas de referência
| Categoria | O que definir | Referência prática |
|---|---|---|
| Cor | marca, semânticas (sucesso/aviso/erro/info), neutros (9–11 passos), superfícies, texto | texto normal ≥ 4,5:1; texto grande/UI ≥ 3:1 |
| Tipografia | famílias + fallback, escala de tamanhos, pesos carregados, entrelinha, tracking | escala modular (1,125–1,25); corpo 16 px, entrelinha 1,4–1,6 |
| Espaçamento | escala única | base 4 px: 4·8·12·16·24·32·48·64 |
| Borda | raios, espessuras | 2–4 raios nomeados (sm/md/lg/pill) |
| Sombra | níveis de elevação (valor completo) | 3–5 níveis; sombra escura precisa de tom do fundo |
| Movimento | durações e easings | 100–150 ms micro · 200–300 ms padrão · 400–500 ms entrada de painel; respeitar `prefers-reduced-motion` |
| Z-index | camadas nomeadas | base 0 · dropdown · sticky · overlay · modal · toast |
| Breakpoints/containers | se houver | os realmente usados |

## Nomenclatura
`<categoria>-<papel>[-<variação>][-<estado>]` em **kebab-case** (CSS) ou camelCase (TS), **um estilo só**: `color-accent`, `color-accent-hover`, `space-4`, `radius-md`, `font-size-lg`, `shadow-2`, `motion-fast`.
Papel > aparência (`color-danger`, não `color-red`), exceto escalas de neutros/primitivos. Prefixos iguais para a mesma categoria em todo o projeto.

## Formatos (emita no formato da fonte; sem fonte, CSS + DTCG)
```css
:root{
  --color-accent:#ffc83d; --color-positive:#2ee59d; --color-negative:#ff5d6c;
  --color-text:#f4f7ff; --color-surface:#10264c;
  --space-1:4px; --space-2:8px; --space-4:16px;
  --radius-md:12px; --shadow-2:0 8px 24px rgb(0 0 0 / .35); --motion-fast:150ms;
}
@media (prefers-color-scheme:dark){ :root{ --color-surface:#10264c } }
```
```json
{ "color": { "accent": { "$type": "color", "$value": "#ffc83d" } },
  "space": { "4": { "$type": "dimension", "$value": "16px" } },
  "motion": { "fast": { "$type": "duration", "$value": "150ms" } } }
```
(DTCG = Design Tokens Community Group; `$type`/`$value`.) Tailwind: `theme.extend.colors/spacing/borderRadius/boxShadow` apontando para as variáveis CSS. TS: `export const tokens = {…} as const`.

## Contraste (cálculo)
Luminância relativa WCAG: canal sRGB `c ≤ 0,03928 ? c/12,92 : ((c+0,055)/1,055)^2,4`; `L = 0,2126R + 0,7152G + 0,0722B`; razão `(Lclaro+0,05)/(Lescuro+0,05)`.
Pares mínimos a checar: texto/superfície, texto secundário/superfície, acento/superfície, estado de erro/superfície, texto sobre botão preenchido.

## Projetos de vídeo (reels-motion-kit)
Se existir `design-system/design-system.json` do kit de reels, ele **é** a fonte de tokens: `colors.accent/positive/negative/info/extra` (destaque, positivo, negativo…) e `fonts`, `shape`, `captions`, `motion`.
Audite/documente a partir dele; o gerador `npm run design` produz `src/brand.generated.ts`.
