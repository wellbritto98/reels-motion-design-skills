# Bloco de ponteiro — para agentes que NÃO descobrem skills sozinhos

Cole o bloco abaixo em **AGENTS.md** (Codex, Antigravity e outros leem), **CLAUDE.md** (Claude Code) ou **GEMINI.md** (Gemini CLI), ajustando o caminho se instalou em outro lugar.
Em Antigravity também pode virar uma *rule* curta em `.agents/rules/design-system.md`.

```markdown
## Design system (skill portátil)
Para auditar, documentar, estender ou extrair o design system deste projeto, **leia `.agents/skills/design-system/SKILL.md`** (ou `.claude/skills/design-system/SKILL.md`)
com leitura de arquivo e siga o procedimento. Modos: audit · document · extend · extract. Os guias estão em `references/` ao lado do SKILL.md.
- Rode `node .agents/skills/design-system/scripts/scan-tokens.mjs . --out design-system/artifacts/scan.json` antes de afirmar números.
- Entregue artefatos (HTML + Markdown) com `scripts/render-artifact.mjs` em `design-system/artifacts/` e cite os caminhos no resumo.
- Somente leitura no código do projeto, a menos que o usuário peça mudanças; nunca invente tokens: lacunas ficam como lacunas.
```
