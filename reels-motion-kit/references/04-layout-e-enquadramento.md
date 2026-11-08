# 04 · Layout, enquadramento e zona segura

**Princípio:** o apresentador está em quadro o vídeo inteiro. O mesmo `<OffthreadVideo>` fica montado de ponta a ponta; só o retângulo da
janela dele muda (animado por mola em `src/layout.ts`). Gráficos e legenda nunca cobrem o rosto.

## Os 4 layouts (1080×1920)
| Layout | Quando | Janela do apresentador | Gráfico (cartão) | Legenda |
|---|---|---|---|---|
| `full` | falando sem gráfico; abertura; fecho; palavras-chave em overlay | tela cheia (vídeo 720×1280 × 1,5) | — | placa opaca embaixo (esconde legenda queimada do original) |
| `stack` | gráfico em cima, ele embaixo | 720×840 em (180, 990) | (40, 110) 1000×720 | costura, y 855 |
| `top` | ele em cima, gráfico embaixo | 720×840 em (180, 110) | (40, 1115) 1000×715 | costura, y 972 |
| `pip` | gráfico grande (cálculo, gráfico alto) | 480×560 em (40, 1340), canto | (40, 110) 1000×1190 (conteúdo ampliado 1,3×) | ao lado dele |
**Alterne `stack` e `top`** entre grupos consecutivos (movimento variado); use `pip` para cálculo/gráfico que precisa de espaço.
Transição: a janela encolhe/cresce em ~0,5 s (mola) começando 5 quadros **antes** do cartão aparecer; o cartão entra com escala+fade.

## Medir o enquadramento (obrigatório a cada vídeo novo)
A janela de `stack/top/pip` mostra uma **faixa vertical** do vídeo: de `cropY` até `cropY + h/s` (em pixels do ORIGINAL).
1. Tire quadros do vídeo em momentos diferentes (ele se aproxima da câmera ao longo do vídeo!):
   `ffmpeg -ss 5 -i public/source.mp4 -frames:v 1 -vf scale=360:-1 work/f5.png` (repita em 25%, 50%, 75%, 95%) e junte com `hstack`.
2. Anote no **pior caso** (cabeça mais alta e mais baixa): topo do cabelo e queixo, em px do original (multiplique por 2 se mediu em 360 px de largura).
3. Ajuste em `layout.ts`: `cropY` tal que `topoCabelo − 30 ≥ cropY` e `queixo + 40 ≤ cropY + h/s`. No vídeo de referência (720×1280): cabelo 190–220, queixo 780–940
   → `cropY = 120`, faixa 120–960.
4. **Legenda queimada do original** (comum em vídeos baixados do Instagram/TikTok): fica em ~78–88% da altura (y ≈ 1000–1120 do original). Mantenha
   `cropY + h/s ≤ 1000` nas janelas divididas; em `full`, a placa opaca da legenda (`cy 1475 ch 245` → cobre 1500–1680 após ×1,5) tem de cobri-la.
   **Sem legenda queimada?** Suba a placa para `cy ≈ 1300` e reduza `ch` — mais ar para o rosto/mãos.
5. Vídeo que não é 720×1280: ajuste `SRC_W/SRC_H` (e `Speaker.tsx` usa as constantes). Se for horizontal, recorte vertical primeiro com ffmpeg
   (`crop=ih*9/16:ih:x:0,scale=720:1280`) com o rosto no centro, e use o resultado como `source.mp4`.
6. Confirme com `npm run stills -- <segundos de troca>`: rosto inteiro, testa a queixo, sem cortar.

## Regras
- **R1 — rosto nunca coberto:** nenhum cartão, pílula, overlay ou legenda sobre o rosto (da testa ao queixo), nem "só por um instante". Overlays em
  `full` ficam acima da cabeça (y ≈ 170–330) **só se houver ≥ 300 px livres**; senão desça para o peito/abaixo do queixo.
- **R7 — zona segura de Reels/Shorts orgânico:** texto e UI importantes em x 90–990, y 220–1520; nada na coluna de botões (x > 940 e y > 1150).
  Fundos/decoração podem sangrar. **O template atual desrespeita isso de propósito em dois pontos** (janela do apresentador até y 1830; placa da legenda
  em `full` até y 1720) porque o apresentador precisa de altura. Se o canal publica só em Reels e a interface cobre o rodapé, suba as janelas
  (`stack` y ≈ 880, `top` y ≈ 90) e a placa (`cy` ≤ 1300) e confira com stills; para YouTube Shorts a margem de baixo é semelhante.
- **Cor natural:** não aplique grade agressiva no rosto (no máximo `saturate(1.04) contrast(1.05) brightness(0.97)`); a identidade vive nos gráficos.
- **Barra de progresso** no topo (y 0–10) é decorativa e pode sangrar.

## Criar um layout novo (ex.: apresentador sempre à direita)
1. Em `layout.ts`: adicione o nome ao tipo `LayoutName`, uma entrada em `LAYOUTS` (janela + caixa de legenda) e em `ZONES` (cartão).
2. Em `timeline.ts` use `layout: 'novo'` nos grupos. Em `Main.tsx` nada muda (lê `ZONES`/`LAYOUTS`).
3. Verifique que `x+w`, `y+h` ficam dentro de 1080×1920 e que janela e cartão não se sobrepõem.
