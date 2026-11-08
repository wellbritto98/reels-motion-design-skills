# reels-motion-kit

Skill + projeto-modelo para editar **reels / shorts verticais de alguém falando** com motion graphics, legenda palavra a palavra,
efeitos sonoros e o apresentador **sempre em quadro**. Nasceu de uma edição real (8:54, 24 telas divididas, 35 gráficos) e foi generalizada:
design system em JSON, biblioteca de gráficos dirigida por dados, tratamento prévio (cortar "é…", pausas e retomadas), imagens e sons livres de direitos.

## Instalar como skill do Claude Code
Copie esta pasta inteira para `~/.claude/skills/reels-motion-kit/` (Windows: `C:\Users\<você>\.claude\skills\reels-motion-kit\`).
A IA passa a usá-la sozinha quando você pedir "edita esse reel", "corta os é… do vídeo", "cria o design system dos meus vídeos" etc.
Para usar sem instalar: abra o `SKILL.md` e peça à IA "siga este SKILL.md".

## Primeira vez (a IA faz, você aprova downloads)
1. `cp -r template C:\reels\meu-video` (caminho curto) · coloque o vídeo em `public/source.mp4`.
2. `node scripts/check_env.mjs` → instale o que faltar (`references/01-setup.md`: Node, ffmpeg, Python+Whisper).
3. `npm install` → `npm run design` → `npm run ds:preview` (aprove a prancha do design system).
4. Fluxo completo no `SKILL.md`.

## Estrutura
- `SKILL.md` — fluxo em 8 etapas + regras.
- `references/` — 01 setup · 02 transcrição · 03 design system · 04 layout · 05 tratamento prévio (corte) · 06 inserções e ritmo · 07 sons · 08 imagens e licenças · 09 render/QA.
- `template/` — projeto Remotion pronto (copie inteiro). `src/examples/financas/` guarda o reel real como referência de ritmo.

## Créditos
O módulo de corte (`template/scripts/corte/`) é adaptado do motor de corte da skill `reel` ([Felpborges/skill-reel](https://github.com/Felpborges/skill-reel); o repositório de origem não traz arquivo de licença — confirme a permissão antes de tornar este repositório público) (corte pelo som, vícios fora, bordas no vale, J/L,
conferência de emendas), portado para Whisper em Python. Efeitos sonoros sintetizados (sem direitos autorais). Imagens de exemplo: ver `CREDITOS.md` de cada projeto.
