# 06 · Inserções, timeline e ritmo

Todo o conteúdo do vídeo vive em `src/content/timeline.ts` (+ `captions.json`, `meta.json`). Para o caso comum a IA **só escreve dados**.

## Anatomia
```ts
GROUPS = [{
  id: 'g4', layout: 'top', from: 51.4, to: 76.3,           // segundos ABSOLUTOS do vídeo
  items: [
    item(51.4, 62.1, 'PhotoCard', {src: 'img/congresso.jpg', credit: 'Foto: Senado Federal · CC BY 2.0', title: 'PEC',
          pills: [{text: 'Criada por X', at: 53.4}]},  [[51.6,'pop'], [53.4,'swipe']]),
    item(62.2, 76.3, 'RowsList', {...}, [[63.0,'swipe']]),   // 2ª página do mesmo cartão (troca com swipe)
  ]}]
OVERLAYS = [{from: 0.4, to: 4.6, kind: 'name', title: 'Nome', sub: 'Cargo'}, {from: 409.3, to: 411.5, kind: 'kw', title: 'Conclusão'}]
```
- **Grupo** = uma tela dividida (apresentador encolhe). `from/to` cobrem todas as páginas. Entre grupos com < 0,7 s de intervalo o apresentador
  muda direto de layout sem voltar à tela cheia.
- **Item** = página do cartão. `at` nas props = segundo absoluto em que a peça entra. Use `wordTime("PEC", 50)` para obter o segundo em que a palavra
  é dita (procura em `captions.json` depois de 50 s). Tolerância: peça no onset da palavra ±0,15 s; **nunca antes** da palavra.
- **Cues** `[segundo, 'nome', volume?]`: efeitos sonoros (ver 07). `ticks(início, passo, n)` para contadores.
- `validate()` (no fim do arquivo) falha cedo se há item fora do grupo, grupo sobreposto, tipo inexistente ou som desconhecido.

## Catálogo (`src/inserts/library.tsx`) — props principais
| type | Para quê | Props |
|---|---|---|
| `TitleCard` | abertura do tema | `kicker, title, highlight, sub, icons[]` |
| `RowsList` | lista de pontos / promessas / ✓✗ | `kicker, rows[{text, icon('check'/'cross'/nome), lead, at, tag, tone}], closing{text,tone,at}` |
| `BigStat` | número que sobe (R$, %, quantidade) | `label, value, format('brl','brl2','int','dec1','dec2','pct'), prefix, suffix, color, at, sub, icon` |
| `Equation` | conta passo a passo | `parts[{t,at,color}], result{value,format,at,color,prefix}, note` |
| `Bars` | comparação de grandezas | `bars[{label,pct,color,value,at}], pill{text,tone,at}` |
| `LineChart` | tendência, queda/alta, duas séries (área entre elas) | `series[{points[],color,label}], at, fillBetween, tags[{text,at,tone}], title` |
| `PhotoCard` | foto livre + crédito, pílulas | `src, credit, title, pills[], note, focusY` |
| `Versus` | A × B | `left{title,sub,icon,tone,at}, right{...}, middle` |
| `Balance` | poder/peso desigual (balança que pende) | `left{label,icon,at}, right{...}, heavier, tiltAt, chips[]` |
| `DotsGrid` | pessoas/itens que mudam de grupo | `labelA, labelB, convertFrom, convertTo, convertCount, total, cols` |
| `Flow` | causa → efeito em passos | `steps[{text,icon,at,tone,final}]` |
| `Quote` | citação do apresentador | `text, who, tone` |
Ícones: `clock coin check cross user people building doc calendar leaf flask chip trend trend-down arrow`. Cores: `gold green red blue violet mute text`.
Exemplos reais (calendário, contador de horas, cascata, balança com pans, gráfico real × inflação) em `src/examples/financas/`.

## Escolher o gráfico pela fala (tabela fala → peça)
| O que a pessoa diz | Peça |
|---|---|
| "Quem decide…?", pergunta retórica | `RowsList` com perguntas / `TitleCard` com "?" |
| Dois lados, conflito, "mas na prática…" | `Versus` / `RowsList` (✓ promessa × ✗ realidade) |
| Poder, peso, desigualdade | `Balance` |
| Número isolado ("o salário mínimo vale 1.621") | `BigStat` |
| Conta ("100 horas × 7,37 = 737") | `Equation` (uma etapa por vez, resultado contando) |
| Comparar tamanhos ("40 h vs 30 h", "1.621 vs 1.297") | `Bars` + pílula com a diferença |
| Cresce/cai ao longo do tempo | `LineChart` (+ tags "PIB ↓") |
| Lugar, lei, instituição, evento | `PhotoCard` (foto livre com crédito) |
| Sequência causal ("se X → Y → Z") | `Flow` |
| Muitas pessoas migrando de situação | `DotsGrid` |
| Frase de efeito do apresentador | `Quote` ou overlay `kw` |
**Peça nova sob medida** (calendário, mapa, relógio…): crie em `library.tsx` seguindo o padrão `{w,h,t0,...props}` e registre em `inserts/index.ts`.

## Ritmo e densidade (do vídeo de referência e da skill `reel`)
- **Algo novo a cada 1,5–4 s**: troca de layout, peça nova ou passo novo dentro de um painel. Trecho > 6 s sem novidade perde a atenção; 12–20 s de tela
  cheia só em momentos de peso (tese, conclusão, pergunta final) ou com overlay `kw`.
- **Uma ideia por gráfico**; ≤ 6 palavras por linha de título, ≤ 10 por linha de apoio; texto fica ≥ 2 s (uma pílula, ≥ 0,8 s).
- **Cada passo na sua palavra:** uma lista revela item a item no instante em que cada um é dito; um cálculo mostra a conta e só então o resultado contando.
- **Alternância**: ~metade do tempo em tela dividida, metade em tela cheia; em vídeos longos (8+ min) 20–25 grupos funcionaram bem.
- **Abertura**: overlay `name` nos primeiros 0,5–4,5 s; primeiro gráfico quando o tema é anunciado. **Fecho**: pergunta/CTA em overlay `kw`.
- **Atribuição**: opinião ou dado controverso vira "Afirmação do apresentador" (pílula) — o gráfico repete o que foi dito, não afirma por conta própria.
- **Números**: só os ditos, ou contas feitas sobre eles (mostre a conta). Se a fala e a tela usam unidades diferentes, avise na entrega.

## Mapa antes do código (`work/mapa.md`)
Uma linha por troca: `tempo | fala (resumo) | layout | peça + props | sons`. Exemplo:
`51.4–62.1 | "PEC criada por…, assinada por…" | top | PhotoCard congresso + 2 pílulas | pop, swipe`. Revise o mapa contra o `transcript.txt` (nada ancorado antes da palavra)
e só depois traduza para `timeline.ts`.

## Regras de componente novo (evita render quebrado)
- **Nunca** chame hook (`useSp`, `useProg`, `useCurrentFrame`) dentro de `if`/`&&`/`?:` — o React troca a contagem de hooks entre quadros e o render **para no meio**
  (erro #310). Chame sempre, no topo, e use o resultado na condição (ex.: `useSp(cond ? delay : 99999)`).
- Animações só por `useCurrentFrame()` (nada de `setTimeout`, CSS transitions/animations, `Math.random()` sem semente).
- Cores/fontes só de `C`/`FONT` (`../ui`); tamanhos pensados para 1000×720 (stack/top) e 1000×915 (pip, já dividido pelo zoom).
- `<Img src={staticFile('img/x.jpg')}>`; imagens grandes ≤ 1400 px de largura.
