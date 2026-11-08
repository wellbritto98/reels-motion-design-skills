# 05 · Tratamento prévio: cortar pausas, "é...", retomadas e erros

Adaptado do motor de corte da skill `reel` (validado em produção), com Whisper em Python. **A regra em uma frase:
*você decide o que fica lendo; o som decide onde cortar.*** A escolha das tomadas é editorial (texto real de cada trecho);
o ponto exato do corte é medido no áudio (volume + timbre + vale de energia), **nunca** no tempo de palavra do Whisper.

Isto tira o tipo de pausa de quem está **tentando lembrar o que vai dizer** ("é…", "éééé", "hum", "então…" esticado, respiro longo),
gagueira, falsas largadas e frases repetidas para corrigir. Mantém o respiro natural entre palavras (≤ 0,2 s) para a fala não
ficar "metralhadora". Entrega um `clean.mp4` com cortes J/L (a voz entra um pouco antes da imagem) que escondem as emendas.

## 0. Vale cortar? (segundos, sem Whisper)
```powershell
$env:PYTHONUTF8=1; $PY="C:\wh\v\Scripts\python"
& $PY scripts/corte/diagnostico.py public/source.mp4
```
Mede pausas pela energia. Regra: pausa > 1,2 s ou ≥ 5 pausas/min acima de 0,5 s → **CORTAR**; 2–5/min → **OPCIONAL** (corte se o vídeo for
reel de fala densa); menos → **LIMPO** (pule para a transcrição). Fala longa e explicativa (aula, análise) tolera mais pausa que um reel de 40 s.
Guarde o original: `copy public/source.mp4 work/bruto.mp4` — **nunca** apague nem sobrescreva o bruto.

## 1. Mapa de tomadas
```powershell
& $PY scripts/corte/tomadas.py work/bruto.mp4 work/corte        # leia work/corte/tomadas.txt INTEIRO
```
Acha a fala pela energia e mostra o que foi dito em cada trecho (retomadas aparecem como linhas parecidas em sequência; falsas
largadas como linhas curtas terminando em "..."). Por padrão usa **uma transcrição única** (rápido: ~4–5 min para 9 min de vídeo em CPU);
`--por-trecho` transcreve cada janela sozinha (mais fiel, ~30 s por janela em CPU — só para dúvidas pontuais).
Em fala com muitas pausas pequenas as "tomadas" saem fragmentadas (0,6–1,5 s): **um keep pode cobrir várias tomadas contíguas** —
o motor remove as pausas internas sozinho.

## 2. Escolher os keeps (decisão editorial — você, a IA)
Escreva `work/corte/keeps.json` (segundos **da fonte**, na ordem do vídeo final):
```json
{"keeps": [
  {"from": 5.80,  "to": 12.15, "why": "gancho"},
  {"from": 12.30, "to": 17.45, "why": "primeiro argumento (tomada 3, a completa)"},
  {"from": 38.60, "to": 46.25, "why": "exemplo — última tomada boa", "raw": false}
]}
```
Regras (da decupagem aprovada):
- **Uma frase, uma tomada: a melhor completa.** Descarte as incompletas (terminam em "..." / param no meio) e as com tropeço audível.
  Entre as completas a padrão é a **mais recente**; exceção: se ela é mais longa/tem muleta e outra é igualmente completa e mais enxuta, fique com a enxuta.
- **Falsa largada de uma palavra também sai.** Se duas tomadas estão a < 1 s uma da outra, o `from` vai **colado** no início da tomada boa.
- **Folga de 0,1–0,2 s** em volta do texto (o motor procura o vale de energia para fora do texto).
- **Juntar tomadas** só quando cada pedaço começa e termina em fim de frase/oração e o resultado fica mais correto ou mais enxuto.
- Se tomadas diferentes dizem **coisas diferentes**, escolha pela informação correta; se não der para saber, **pergunte** a quem gravou.
- **Sempre sai:** "alô, alô", teste de som, tosse, "deixa eu refazer", comentário fora do roteiro.
- **Primeira sílaba comida?** adiante o `from` 0,1–0,2 s, marque `"raw": true` (entra exatamente como está) ou use `force` em `ajustes.json`.
- Gravação já "contínua" (sem retomadas, só hesitações e pausas)? Faça **um keep por bloco de fala** cobrindo tudo e deixe o motor tirar vícios e pausas.

## 3. Vícios ("éé", "ããã", "hum", conjunção esticada)
```powershell
& $PY scripts/corte/vicios.py work/corte        # lista os "éé/hum" dentro de cada keep
```
O Whisper normalmente **apaga** hesitações; o kit usa um prompt cheio delas (`PROMPT_VICIOS` em `corte/comum.py`) para ele **escrevê-las**.
O motor então: hesitação pura (`aa, ee, eh, ah, hum, hm, uh, umm`, ou uma letra repetida) → **inteira vira silêncio**; conjunção esticada
(`e, a, um, o` com 0,45–1,6 s) → fica só o começo (0,14 s). Acima de 1,6 s não corta sozinho (é retomada/pausa longa: decisão editorial → `ajustes.cut`).
Tudo o que sai fica em `vicios-removidos.txt`.

## 4. Cortar
```powershell
& $PY scripts/corte/corte.py work/bruto.mp4 work/corte            # --jl 4 (padrão) · --jl 0 desliga · --sem-video só áudio+edl
```
Por dentro (valores em `corte.py`, topo): fala = volume **E** inclinação espectral (respiração e ruído de boca ficam de fora); limiares se ajustam ao
nível da **sua** gravação (p90 da fala → `REF_DB`); buracos < `HOLE` 0,20 s ficam (respiro natural); ilhas < `ISLAND` 0,07 s saem (estalos);
`LEAD` 0,06 s / `TAIL` 0,14 s protegem ataque e "s" final; bordas do keep encostam no vale de energia; trechos a < 0,08 s se fundem;
cortes caem no quadro de 30 fps; fade 8 ms entrada / 12 ms saída em cada trecho (sem estalo); **J/L alternados** (4 quadros) em emendas
reais (≥ 0,25 s removidos). Saída: `clean.mp4` (mesma resolução do bruto, 30 fps), `edl.json`, `corte.wav`, `cortepalavras.json`.
Ajustes finos em `work/corte/ajustes.json` (tempos da fonte): `{"cut": [[a,b]], "keep": [t], "force": [[a,b]]}` —
`cut` remove um intervalo (um "éé" que o Whisper não escreveu), `keep` protege um vício que deve ficar, `force` mantém um som que não é voz.

## 5. Conferir (obrigatório — leia a saída INTEIRA)
```powershell
& $PY scripts/corte/conferir.py work/corte --prompt "Nomes, Siglas, Marcas do vídeo"
```
`conferencia.txt`: texto do corte; **repetições coladas** (esperado: "nenhuma"); cada **emenda** em ±2 s (marcada com ‖); **pausas > 0,25 s que sobraram**
(esperado: "nenhuma"). Critérios: cada frase uma vez só; nenhuma palavra comida (erro de **nome** do Whisper não reprova: corrige na legenda);
emendas legíveis (sem meia palavra); nenhuma pausa > 0,25 s (0,35 s é o teto aceitável para o estilo).
Palavra comida → proteja o intervalo (`raw`/`force`) e corte de novo. Antes de concluir que algo sumiu, transcreva só aquela janela (`--por-trecho`).

## 6. Entregar para o resto do pipeline
`copy work/corte/clean.mp4 public/source.mp4` → depois **retranscreva** (`02`) — nunca misture tempos do bruto com os do vídeo limpo.
Se já havia gráficos/legendas cronometrados no corte antigo e a decupagem mudou, remapeie (não recronometre à mão):
`from remapear import Mapa; m = Mapa("velho/cortepalavras.json", "novo/cortepalavras.json"); m.novo(t_velho)`.
Relatório curto ao usuário: duração bruto → corte, tomadas usadas (com `why`), o que ficou de fora, vícios removidos, resultado da conferência,
incertezas (o que só se valida ouvindo).

## Diagnóstico: sintoma → causa → ajuste (mude UM parâmetro por vez em `corte.py` e registre)
| Sintoma | Causa provável | Ajuste |
|---|---|---|
| Frase dobrada ou "então então" | keep pegou falsa largada/duas tomadas | mover `from`/`to`; separar em dois keeps |
| Primeira sílaba comida | palavra soprada abaixo do limiar / `from` atrasado | adiantar `from` 0,1–0,2 s; `"raw": true`; `force` |
| Final da palavra cortado ("slide" em vez de "slides") | `TAIL` curto / `to` curto | estender `to`; `TAIL` → 0,18 |
| Respiração audível entre frases | limiares baixos demais | `REF_DB` −20 → −22 (limiares sobem 2 dB) |
| Palavras inteiras sumindo em trechos baixos | limiares altos demais (voz baixa, microfone longe) | `REF_DB` −20 → −18; `force` no trecho |
| Fala "metralhadora", sem respiro | `HOLE` pequeno | `HOLE` → 0,25 |
| Pausas ainda perceptíveis | `HOLE` grande ou ruído alto (ar-condicionado) | `HOLE` → 0,15; checar se o ruído passa como fala |
| "éé" que ficou | o Whisper não escreveu o vício | `ajustes.cut` com o intervalo |
| Hesitação que devia ficar foi cortada | vício detectado em contexto intencional | `ajustes.keep` com o início dela |
| Estalo na emenda | borda do keep dentro de palavra | folga maior / mover borda |
| Emenda parece "pulo" de imagem | J/L pequeno ou desligado | `--jl 4` ou `--jl 6` |
| Boca fora de sincronia perto da emenda | J/L grande demais | `--jl 2` ou `--jl 0` |
Gravação diferente (lapela, sala com eco, ruído)? Ajuste um parâmetro, anote o perfil e o motivo; só mude o padrão se valer para todas.

## Limites e honestidade
- O motor foi calibrado em voz masculina com microfone próximo e sala tratada; outras gravações pedem a tabela acima.
- O modo rápido (transcrição única) é menos fiel que a janela isolada para achar repetição escondida: em emenda suspeita, rode `--por-trecho`.
- Vídeo com **música alta ou ruído constante** ao fundo confunde o detector (música passa como fala): corte manualmente com `ajustes.cut`.
- O corte só mexe no tempo; não faz recorte 9:16, legendas, cor nem normalização (isso é do resto do kit).
