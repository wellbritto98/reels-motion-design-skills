---
name: reels-motion-kit
description: Kit completo para editar REELS / Shorts / vídeos verticais 9:16 de alguém falando, com motion graphics, legendas palavra a palavra, efeitos sonoros e o apresentador SEMPRE em quadro (a cada gráfico o vídeo dele encolhe e a tela se divide). Cobre do zero ao MP4 final — instalar o ambiente (Node, ffmpeg, Python + Whisper, Remotion), tratamento prévio (cortar silêncios, "éé", pausas de quem está lembrando e retomadas, com conferência de cada emenda), transcrição com tempo por palavra, DESIGN SYSTEM do canal em JSON (cores, fontes, formas, legenda) que todo vídeo segue, biblioteca de inserções dirigidas por dados (números, barras, balança, linha, fotos, comparação, fluxo…), efeitos sonoros sintetizados ou baixados de fontes livres, imagens livres de direitos ou com crédito na descrição (Wikimedia Commons, Openverse), render, mixagem final (−14 LUFS) e checklist de entrega. Use SEMPRE que pedirem para editar/montar/animar um reel, short, vídeo vertical ou vídeo de "pessoa falando" com motion graphics, criar o design system ou identidade visual dos vídeos de um canal, "cortar os é... do vídeo", transcrever com Whisper para legenda, ou preparar o ambiente (ffmpeg/whisper/remotion) para edição por IA — mesmo sem citar o nome da skill. NÃO serve para vídeo longo horizontal de YouTube sem apresentador, animação 3D, geração de vídeo por IA, roteiro/copy ou publicação.
---

# reels-motion-kit — do bruto ao MP4 com motion graphics

Um projeto **Remotion** autônomo (`template/`) + guias (`references/`). A IA copia o template para uma pasta nova,
define/aplica o **design system**, trata o áudio/vídeo bruto, transcreve, escreve **um arquivo de timeline** com dados
(sem escrever React para o caso comum), renderiza e verifica. O resultado foi validado num vídeo real de 8:54 (economista
explicando uma proposta de salário por hora): 24 telas divididas, 35 gráficos, legenda palavra a palavra, 12 efeitos sonoros.

**Nunca publique, envie ou faça upload do vídeo.** Peça autorização antes de baixar qualquer arquivo (modelo, imagem, som):
diga nome, fonte, licença e tamanho. O apresentador **nunca sai de quadro**: nenhum cartão cobre o rosto.

## Mapa

```
SKILL.md                  este fluxo
references/               guias (leia só o que a etapa pede)
  01-setup.md             Node · ffmpeg · Python/venv curto · Whisper · Chrome · diagnóstico
  02-transcricao-e-legendas.md   Whisper com tempo por palavra, correção à mão, regras de legenda
  03-design-system.md     criar/aplicar o design system (JSON → tokens), entrevista, prancha, regras
  04-layout-e-enquadramento.md   full/stack/top/pip, janela do rosto, zona segura, rosto nunca coberto
  05-tratamento-previo.md cortar silêncios, "éé", retomadas; J/L; conferência; diagnóstico
  06-insercoes-e-ritmo.md biblioteca de gráficos, como escrever o timeline, cadência, ancorar na fala
  07-sons.md              efeitos sintetizados, cues, onde baixar de graça, licenças, mixagem
  08-imagens-e-licencas.md  imagens/SVG livres, créditos na descrição/legenda, tabela de licenças
  09-render-qa-entrega.md stills, render, mixagem final, VERIFY, armadilhas
template/                 projeto Remotion pronto (copie inteiro)
  design-system/          design-system.json (ativo) + exemplos/
  src/                    Main, layout, legendas, ui, inserts/library.tsx, content/{timeline,captions,meta}
  src/examples/financas/  reel real completo (referência de ritmo e densidade; não é importado)
  scripts/                check_env · transcribe · fix_words · corte/* · fetch_images · gen_sfx · stills · render · finalize_audio · audio_final · verify
  public/sfx/             12 efeitos sintetizados (sem direitos autorais)
```

## Fluxo (ordem fixa; avise em uma linha antes de cada etapa lenta e rode-a em segundo plano)

### 0 · Projeto
1. Crie uma pasta por vídeo e copie o template: `cp -r <skill>/template <pasta>/reel-<slug>` (Windows: `Copy-Item -Recurse`).
   **Use caminho curto** (ex.: `C:\reels\slug`): caminhos longos quebram o pip/torch no Windows.
2. Coloque o bruto em `public/source.mp4` (não escreva na pasta de origem do bruto).
3. Diagnóstico do ambiente: `node scripts/check_env.mjs` e instale o que faltar seguindo `references/01-setup.md`.
4. `npm install`. Sem vídeo ainda? `node scripts/make_demo_source.mjs` gera um de teste (smoke test do template).

### 1 · Design system (antes de qualquer gráfico) — `references/03-design-system.md`
- Se o usuário **já tem** identidade (cores, fontes, logo): traduza para `design-system/design-system.json`.
- Se **não tem**: faça a entrevista curta (nicho, tom, 2–3 cores, fonte), proponha, edite o JSON.
- `npm run design` gera os tokens; `npm run ds:preview` renderiza a **prancha** (`work/stills/DesignSystem_0.png`).
  Mostre ao usuário e **só avance com o OK dele**. Depois disso **todo vídeo do canal reaproveita o mesmo JSON**.

### 2 · Tratamento prévio (corte) — `references/05-tratamento-previo.md`
`node scripts/py.mjs scripts/corte/diagnostico.py public/source.mp4` diz em segundos se vale cortar (LIMPO / OPCIONAL / CORTAR).
Se cortar: `tomadas → (você escreve keeps.json) → vicios → corte → conferir`, e o `clean.mp4` vira o novo `public/source.mp4`
(guarde o original como `work/bruto.mp4`). **Nenhuma palavra comida; nenhuma pausa > 0,35 s.** Pule se o vídeo já está limpo.

### 3 · Transcrição e legenda — `references/02-transcricao-e-legendas.md`
`node scripts/py.mjs scripts/transcribe.py public/source.mp4 --lang pt --model small --prompt "<nomes próprios e siglas>"` →
leia `work/transcript.txt` inteiro **para entender o conteúdo** → liste os erros em `content-fixes/word-fixes.json` →
`node scripts/fix_words.mjs` gera `src/content/captions.json`. Atualize `src/content/meta.json` (`durationSeconds`).

### 4 · Enquadramento — `references/04-layout-e-enquadramento.md`
Tire quadros (ffmpeg), meça onde fica o rosto e ajuste `cropY` (e `SRC_W/SRC_H` se o vídeo não for 720×1280) em `src/layout.ts`.
A janela do apresentador mostra uma faixa vertical do vídeo: o rosto inteiro tem de caber, a legenda queimada do original
(se houver) tem de ficar fora.

### 5 · Mapa e timeline — `references/06-insercoes-e-ritmo.md`
1. Do `transcript.txt`, escreva `work/mapa.md`: tempo × fala × layout × gráfico (veja a tabela de padrões fala→gráfico).
2. Pesquise **materiais reais** (imagens/SVG livres: `references/08`; sons: `references/07`) e registre licenças.
3. Escreva `src/content/timeline.ts` (GROUPS/OVERLAYS/cues) usando `item(from,to,'Tipo',{props},[cues])` e `wordTime("palavra")`
   para prender cada peça à fala. Algo novo a cada 1,5–4 s; ≥ 2 s de leitura por texto; um gráfico por ideia.
4. Gráfico que a biblioteca não tem → componente novo em `src/inserts/library.tsx` + registro em `inserts/index.ts`
   (use `src/examples/financas/` como inspiração: balança, calendário, contadores, cascata…).
5. Os dados do gráfico **só repetem o que a pessoa disse** (ou conta feita sobre números ditos). Atribua opiniões
   ("Afirmação do economista"). Nunca invente número, logo ou fonte.

### 6 · Verificar antes de gastar render — `references/09-render-qa-entrega.md`
`npm run typecheck` · `npm run stills -- <segundos…>` nos pontos de troca e em cada tipo de gráfico, abra os PNG
(`Read`) e confira: rosto livre, nada cortado, texto legível, transição sem sobreposição. Corrija **antes** do render
completo (ele leva ~40 min por 9 min de vídeo).

### 7 · Render e áudio
`npm run render` (segundo plano; `CONCURRENCY=4`, `REMOTION_BROWSER=<chrome-headless-shell>` opcional) →
`npm run finalize` (remixa SFX mais baixos e pico seguro, sem rerender) **ou** `node scripts/py.mjs scripts/audio_final.py <in> <out>` (−14 LUFS).

### 8 · Entrega
`node scripts/py.mjs scripts/verify.py out/video_final.mp4 --sfx-count <N>` → `VERIFY.md`. Responda com: caminho do MP4, duração,
LUFS/pico, nº de telas e efeitos, correções de legenda, **créditos de imagens para a descrição**, pontos abertos
(o que o apresentador deve conferir: números, nomes, afirmações). Ajuste pedido → nova versão, nunca sobrescreva a anterior.

## Regras que valem por cima de tudo
1. **Rosto sempre visível** (R1). Gráfico e legenda usam tela dividida; em tela cheia só peças pequenas fora do rosto.
2. **Material real, licença registrada.** Imagem sem licença clara não entra. CC BY → crédito na descrição.
3. **Som enxuto:** ≤ 0,85 efeito/s, volumes baixos, nada < 0,6 s depois de outro som; a voz nunca é processada além do ganho final.
4. **Nada comido no corte.** Toda emenda é conferida; palavra comida → proteja o trecho e corte de novo.
5. **Design system único** por canal; cores/fontes só pelos tokens (`C`, `FONT`), nunca hex solto nos componentes.
6. **Hooks do React nunca dentro de `if`** nos componentes de inserção (o render para no meio).
7. **Segredos e downloads:** modelos, imagens e sons só com autorização do usuário; nunca burle CAPTCHA/anti-robô.
8. **Uma versão por rodada**, completa e verificada. Declare o que não foi verificado (ex.: ouvir o vídeo inteiro).
