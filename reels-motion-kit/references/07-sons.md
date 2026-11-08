# 07 · Efeitos sonoros: gerar, baixar e mixar

## Caminho padrão: sintetizados (zero licença, zero download)
`public/sfx/` já traz 12 sons curtos gerados por `scripts/gen_sfx.py` (numpy; `python scripts/gen_sfx.py` recria). **Não têm direitos autorais**:
são ondas e ruído sintetizados. Use-os por padrão.
| Nome | Dur. | Uso |
|---|---|---|
| `whoosh_in` / `whoosh_out` | 0,45 / 0,40 s | entrada/saída de tela dividida (automáticos no timeline) |
| `swipe` | 0,22 s | troca de página dentro do cartão; entrada de linha |
| `pop` | 0,12 s | peça pequena aparecendo (pílula, ícone) |
| `tick` / `blip` | 0,05 / 0,03 s | contadores subindo (use `ticks()`), digitação |
| `ding` | 1,1 s | resultado/confirmação suave |
| `coin` | 0,28 s | dinheiro, valor aparecendo |
| `success` | 0,8 s | ✓ positivo |
| `buzz` | 0,4 s | ✗ negativo, erro, alerta |
| `thud` | 0,6 s | carimbo, impacto, palavra-chave pesada |
| `riser` | 1,6 s | tensão antes de uma virada (balança pendendo, queda) |
Para um som novo: edite `gen_sfx.py` (cada `save(nome, onda)`), registre `nome` em `SFX_BASE` (`vol`, `dur`) em `timeline.ts`.
Alternativa só-ffmpeg (sem Python): `ffmpeg -f lavfi -i "anoisesrc=color=pink:d=0.55" -af "highpass=f=300,lowpass=f=5500,afade=t=in:d=0.28,afade=t=out:st=0.3:d=0.25" whoosh.wav`.

## Quando baixar sons reais (só se o usuário quiser mais "realismo")
**Peça autorização antes** com a lista: nome, fonte, licença, tamanho. Registre cada arquivo em `public/sfx/CREDITOS-SOM.md`.
| Fonte | Licença | Como |
|---|---|---|
| Biblioteca de áudio do YouTube Studio | livre para vídeos no YouTube (veja termos; alguns pedem crédito) | manual pelo usuário (Studio → Biblioteca de áudio) |
| Pixabay (pixabay.com/sound-effects) | Pixabay Content License (comercial, sem crédito obrigatório) | **evite faixas marcadas "Content ID Registered"** (podem gerar reivindicação) |
| Freesound (freesound.org) | só **CC0** ou **CC BY** (crédito na descrição) | **nunca NC**; baixar exige login/API key do usuário |
| Mixkit (mixkit.co) | Mixkit License (comercial, sem crédito) | conferir a página do item |
Regras: sem licença NC; sem "editorial only"; sem origem incerta; sem rip de vídeo; nunca burle login/CAPTCHA — peça o arquivo ao usuário.
Formato: converta para WAV 44,1 kHz mono (`ffmpeg -i in.mp3 -ac 1 -ar 44100 public/sfx/nome.wav`), corte silêncio nas pontas, normalize o pico a ~−3 dBFS.

## Onde colocar cada som (densidade e parcimônia)
- **≤ 0,85 efeito por segundo** no vídeo todo (um vídeo de 40 s ≈ 34; um de 9 min usou ~330 cues, médias 0,6/s). `verify.py --sfx-count` confere.
- `whoosh` só em troca de tela dividida (já automático); `thud` só em carimbo/virada; sem som em chip pequeno ou item que entra < 0,6 s depois de outro som.
- Contadores: `ticks()` curtos (`tick`, vol 0,12–0,2), terminando em `coin`/`ding`.
- Cada cue vive **junto da peça** no timeline (`item(..., [[t,'pop'], ...])`) para mudar uma e o som acompanhar.
- Volumes: base em `SFX_BASE`; `sfx.gain` do design system multiplica tudo (0,8 discreto … 1,3 energético).

## Mixagem
O render mistura voz (do `source.mp4`) + SFX. A voz fica **sem processamento**. Depois:
- `npm run finalize` (`scripts/finalize_audio.py`): extrai só os SFX (saída − fonte), remixa com `--sfx 0.8` e aplica **ganho único** até pico −1,5 dBFS,
  sem limitador, **sem rerenderizar**. Ótimo quando a voz do bruto já está num bom volume (ex.: −14 LUFS).
- `python scripts/audio_final.py` (loudnorm em 2 passadas + limitador) quando o volume geral precisa ir a −14 LUFS (Reels/Shorts).
- Ouça o resultado: SFX devem ficar ~8–12 dB abaixo da voz; cues simultâneos (ex.: `buzz` + `thud`) somam — espalhe 0,15 s.
