# 02 · Transcrição e legendas

Objetivo: (a) a IA **entende o conteúdo** lendo o texto; (b) `src/content/captions.json` = `[{w, s, e}]` palavra a palavra com tempo,
com o texto **certo**. A legenda segue a boca (palavra ativa na cor de destaque).

## Passo a passo
```powershell
$env:PYTHONUTF8=1
C:\wh\v\Scripts\python scripts/transcribe.py public/source.mp4 --lang pt --model small --prompt "João Victor, PEC, CLT, FGTS, INSS"
```
- `--prompt` = nomes próprios, marcas, siglas e jargões **como devem ser escritos**: melhora muito o acerto do Whisper.
- Saídas: `work/words_raw.json` (palavras com tempo), `work/transcript.txt` (uma linha por trecho, `[início-fim] texto`).
- **Leia `work/transcript.txt` inteiro** antes de planejar gráficos: é assim que a IA "assiste" ao vídeo. Anote: tese, argumentos em
  ordem, números ditos, nomes, pedidos ao público (CTA).
- Confira 3–4 quadros do vídeo (`ffmpeg -ss T -i … -frames:v 1`) para ver legenda queimada, quem fala, enquadramento.

## Corrigir erros do Whisper (R6: legenda com o texto certo)
Liste cada erro em `content-fixes/word-fixes.json` e rode `node scripts/fix_words.mjs`:
```json
[
  {"match": ["Saigip"], "replace": ["Sergipe"]},
  {"match": ["econômico"], "replace": ["economista"], "first": true},
  {"match": ["da","Simu","Teseiro","Feras"], "replace": ["décimo","terceiro","férias"]}
]
```
- Compara palavras sem pontuação final e sem diferenciar maiúsculas; **mantém o tempo** (reparte se o nº de palavras mudar) e a pontuação.
- O relatório mostra `SEM ACERTO` para regra que não casou (quase sempre acento ou pontuação no meio): ajuste o `match`.
- Onde o Whisper errou e **você não tem certeza** do que foi dito: confira o áudio/legenda queimada do original, ou deixe como está e
  avise o apresentador na entrega. Não "adivinhe" número nem nome.
- Números: se o gráfico usa o número, verifique a conta (ex.: 1.621 ÷ 220 = 7,37; 176 × 7,37 = 1.297,12).
- Erros comuns em PT-BR: siglas lidas como palavras (PEC→"pet"), nomes de marca, números por extenso, "A" por "IA", nomes estrangeiros.
- Guarde `work/words_raw.json` (o original) — corrija por tempo/regra, nunca apague o original.

## Regras da legenda (já implementadas em `src/Captions.tsx`)
- Blocos de ≤ 5 palavras / ≤ 30 caracteres; quebra em pausa > 0,55 s e em pontuação (`, . ? !`).
- Palavra ativa em `CAPTION.highlight`; resto em `C.text`; sombra leve. Em tela cheia, **placa opaca** (esconde legenda queimada do original);
  em tela dividida, texto na costura entre gráfico e apresentador.
- Palavra-código de CTA ("comente ECONOMIA"): escreva em CAIXA ALTA no `word-fixes.json`.
- Tamanhos e caixa alta vêm do design system (`captions.sizeFull/sizeSplit/uppercase`).

## Armadilhas do Whisper (aprendidas em produção)
| Armadilha | Como aparece | O que fazer |
|---|---|---|
| Modelo `.en` com áudio em PT | texto sem sentido | usar `small`/`medium` (multilíngue) |
| Inventa fala em silêncio longo | repete a frase anterior | `condition_on_previous_text=False` (já no kit); transcrever só a janela suspeita |
| Tempos de palavra deslocados (décimos de segundo) | peça aparece antes/depois da palavra | **nunca cortar** pelo tempo de palavra (corte é pelo som); para gráficos, ±0,15 s é aceitável |
| Esconde repetição ("Então... Então") | vira um "Então" | conferência de emendas (05) |
| Erra nomes/siglas | PEC→pet, nomes próprios | `--prompt` + `word-fixes.json` |
| Prompt de vícios em janela curta inventa "é, ah, hum" | texto fantasma | prompt de vícios só nos keeps; emendas sem prompt |
| JSON do Windows com acento quebrado | `�` | `PYTHONUTF8=1` |
