# 09 · Render, QA e entrega

## 1. Verificar barato antes de renderizar
```powershell
npm run design            # se mexeu no design system
npm run typecheck         # 0 erros
npm run stills -- 2 7 22 53 120   # PNGs em work/stills/ (metade da resolução, ~1,5 s cada); --scale 1 para tamanho real
```
Escolha os tempos: **um por tipo de gráfico**, os **pontos de troca** (início/fim de cada grupo), cada **overlay**, o **primeiro quadro** e o **último**.
Monte contact sheets para olhar vários de uma vez: `ffmpeg -i a.png -i b.png -i c.png -filter_complex "[0]scale=420:-1[a];[1]scale=420:-1[b];[2]scale=420:-1[c];[a][b][c]hstack=3" row.png`
e abra com `Read`. **Olhe de verdade**; não declare aprovado sem abrir as imagens.
Confira em cada quadro: rosto inteiro e livre · texto não cortado nem sobreposto · legenda legível e fora do rosto · cartão sem espaço vazio absurdo ·
números/nomes certos · imagem certa · crédito legível. Quadro em plena transição (mola) mostra sobreposição passageira — é normal; veja 0,5 s depois.
Gráficos que dependem do tempo (contadores, linhas) devem ser vistos no **fim** da animação: `stills -- <at + 2>`.

## 2. Render completo
```powershell
npm run render           # → out/video.mp4 (h264 crf 20). Em segundo plano; ~40 min para 9 min de vídeo com 4 processos
```
- Estimativa medida: ~4,5–5 min de render por minuto de vídeo (534 s de vídeo levaram ~42 min; CPU de 8–12 núcleos, concurrency 4).
  Para 40 s de reel: ~3 min. Avise o usuário do tempo antes de começar.
- Progresso aparece a cada 5%. **Não faça polling com sleep**; espere a notificação de término.
- Se parar com erro em algum quadro: leia a mensagem. `React error #310` = hook condicional (ver 06). `Error: ... staticFile` = arquivo ausente em `public/`.
  Corrija e **reinicie** (não há retomada); por isso valide com stills em todos os tipos antes.
- `REMOTION_BROWSER` evita baixar outro Chrome; `CONCURRENCY` sobe/desce paralelismo (RAM ≈ 1–1,5 GB por processo).

## 3. Áudio final
`npm run finalize` → `out/video_final.mp4` (recupera SFX, `--sfx 0.8`, ganho único até pico −1,5 dBFS; **não rerenderiza**).
Para levar o volume geral a −14 LUFS: `python scripts/audio_final.py out/video_final.mp4 out/video_loudnorm.mp4 --alvo -14`.
Se o SFX ficou alto/baixo: `python scripts/finalize_audio.py --sfx 0.6` (ou 1.0) e refaça — leva segundos.

## 4. Verificação e entrega
```powershell
python scripts/verify.py out/video_final.mp4 --sfx-count <SFX_CUES.length> [--lufs -14]
```
Escreve `VERIFY.md` (resolução 1080×1920, duração, pico, LUFS, pausas na voz, densidade de SFX) e a lista do que **só o olho/ouvido** confere. **Assista ao vídeo
inteiro com som** antes de dizer que está pronto; se não puder, diga explicitamente que não conferiu.

### Portões de aceite
| # | Portão | Alvo |
|---|---|---|
| 1 | Corte (se houve) | todas as emendas conferidas; nenhuma palavra comida; nenhuma pausa > 0,35 s |
| 2 | Legenda | texto corrigido (nomes, siglas, números); original guardado |
| 3 | Fatos | cada número na tela = o dito ou conta mostrada; opiniões atribuídas |
| 4 | Imagens | licença registrada; CC BY nos créditos |
| 5 | Stills | rosto livre; nada cortado; texto legível; todos os tipos de gráfico vistos |
| 6 | SFX | ≤ 0,85/s; nada < 0,6 s depois de outro som |
| 7 | Áudio | pico ≤ −1 dBFS; LUFS conforme o destino; voz sem processamento |
| 8 | Formato | 1080×1920 · 30 fps · AAC |
| 9 | Segurança | nada publicado/enviado; downloads autorizados |

### O que dizer na entrega (curto, em português)
Caminho do MP4 · duração (bruto → final) · LUFS/pico · nº de telas divididas, gráficos e efeitos · correções de legenda · **créditos de imagens para colar na descrição** ·
decisões que dependem do apresentador (números/nomes/afirmações para conferir) · o que não foi verificado · como pedir ajustes (cada ajuste = nova versão `video_v2`).

## 5. Armadilhas (lições do vídeo de referência)
- Renderizou 12 min e **parou** num hook condicional → valide stills de **todos** os tipos de componente em estados diferentes (antes e depois do `at`).
- Cartão **vazio por 3 s** antes do primeiro item entrar (item com `at` tardio): coloque ao menos kicker/título no `t0`, ou antecipe o primeiro `at`.
- Texto longo quebrando em 3 linhas dentro de `Row`: encurte (≤ 6 palavras) em vez de reduzir fonte.
- Contador contando **depois** da fala do número: ancore `at` no onset da palavra do número (`wordTime`) e use 1–1,5 s de contagem.
- Overlays `kw` sobre cabeça muito alta: reposicione (top 190 → 1300 no peito) após medir.
- Pico original já ≥ 0 dBFS (vídeo baixado de rede social): o render copia; `finalize` baixa o ganho em ~1,6 dB — comum e esperado.
- Vídeo > 15 min: considere dividir em partes (`meta.json` + `Sequence`s) ou renderizar com `--concurrency` menor se a RAM acabar.
