# reels-motion-design-skills

Duas skills para agentes de código (Claude Code, Codex, Antigravity), feitas para funcionar com qualquer um dos três:

| Pasta | O que é |
|---|---|
| [`reels-motion-kit/`](reels-motion-kit/) | Edição de **reels/shorts verticais de alguém falando** com motion graphics, legenda palavra a palavra, efeitos sonoros e o apresentador sempre em quadro. Setup (Node, ffmpeg, Whisper, Remotion), tratamento prévio (corta "é…", pausas e retomadas), design system em JSON, biblioteca de gráficos por dados, imagens/sons livres de direitos e checklist de entrega. |
| [`design-system-skill/`](design-system-skill/) | Skill **design-system** agnóstica de agente: *audit · document · extend · extract* com varredura de tokens e **artefatos** (HTML autocontido + Markdown). Inclui instalador e adaptadores para Claude Code, Codex e Antigravity. |

Cada pasta tem seu próprio README com instalação e uso. Ambas seguem o formato comum de skill (pasta com `SKILL.md`), então podem ser copiadas para `.claude/skills/`, `.agents/skills/` ou para as pastas globais de cada agente.

## Créditos e licenças
- O módulo de corte de `reels-motion-kit/template/scripts/corte/` é adaptado da skill `reel` ([Felpborges/skill-reel](https://github.com/Felpborges/skill-reel)), cujo repositório **não traz arquivo de licença**: este repositório é **privado** por esse motivo. Obtenha permissão ou reescreva o módulo antes de torná-lo público.
- As ideias de passes de revisão e de extração de tokens do `design-system-skill` vêm de [Trystan-SA/claude-design-system-prompt](https://github.com/Trystan-SA/claude-design-system-prompt) (MIT), reescritas com palavras próprias.
- `reels-motion-kit/template/src/examples/financas/` contém a transcrição de um reel real de terceiro, usada só como referência de ritmo; remova antes de publicar.
- Efeitos sonoros do template: sintetizados (sem direitos autorais).
