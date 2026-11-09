# reels-motion-design-skills

Duas skills para agentes de código (Claude Code, Codex, Antigravity), feitas para funcionar com qualquer um dos três:

| Pasta | O que é |
|---|---|
| [`reels-motion-kit/`](reels-motion-kit/) | Edição de **reels/shorts verticais de alguém falando** com motion graphics, legenda palavra a palavra, efeitos sonoros e o apresentador sempre em quadro. Setup (Node, ffmpeg, Whisper, Remotion), tratamento prévio (corta "é…", pausas e retomadas), design system em JSON, biblioteca de gráficos por dados, imagens/sons livres de direitos e checklist de entrega. |
| [`design-system-skill/`](design-system-skill/) | Skill **design-system** agnóstica de agente: *audit · document · extend · extract* com varredura de tokens e **artefatos** (HTML autocontido + Markdown). Inclui instalador e adaptadores para Claude Code, Codex e Antigravity. |

## Setup inicial (qualquer harness)
Leia [`SETUP.md`](SETUP.md) (passo a passo para uma IA ou para você) e use `node bootstrap.mjs`:
```bash
node bootstrap.mjs check                                                # diagnóstico, não instala nada
node bootstrap.mjs install-skills --target all --scope project --project <repo> --dry-run
node bootstrap.mjs new-project C:/reels/meu-video --install --demo      # projeto de vídeo de teste (caminho curto)
node bootstrap.mjs whisper-venv --yes                                   # venv do Whisper (~700 MB; só com autorização)
```
`AGENTS.md`, `CLAUDE.md` e `GEMINI.md` na raiz apontam o agente para essas instruções.

Cada pasta tem seu próprio README com instalação e uso. Ambas seguem o formato comum de skill (pasta com `SKILL.md`), então podem ser copiadas para `.claude/skills/`, `.agents/skills/` ou para as pastas globais de cada agente.
