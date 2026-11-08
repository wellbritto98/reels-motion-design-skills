# design-system — skill portátil (Claude Code · Codex · Antigravity)

Pacote com **uma skill neutra** (`design-system/`) que audita, documenta, estende e extrai o design system de um projeto e entrega **artefatos** (HTML autocontido + Markdown).
Baseada nas instruções do comando `/design:design-system` (audit · document · extend), ampliada com o modo **extract** e passes de revisão
(ideias do repositório MIT [Trystan-SA/claude-design-system-prompt](https://github.com/Trystan-SA/claude-design-system-prompt), redação própria).

## Por que funciona nos três
Claude Code, Codex e Antigravity leem a mesma estrutura: **pasta com `SKILL.md`** (frontmatter `name` + `description`) mais `scripts/`, `references/` etc. O `SKILL.md` não usa nenhum recurso de um fornecedor;
tudo o que faz é ler arquivos, rodar `node` (sem dependências) e escrever arquivos. Artefatos = arquivos em `design-system/artifacts/`.

| Agente | Pasta no projeto | Pasta global | Invocação |
|---|---|---|---|
| Claude Code | `.claude/skills/design-system/` | `~/.claude/skills/design-system/` | `/design-system audit` ou linguagem natural |
| Codex | `.agents/skills/design-system/` | `~/.agents/skills/design-system/` | linguagem natural (cite o nome); fallback: bloco no `AGENTS.md` |
| Antigravity | `.agents/skills/design-system/` | `~/.gemini/config/skills/design-system/` | `/design-system` no App, ou automático pela `description` |

## Instalar
```bash
node design-system/scripts/install.mjs --target all --scope project --project <seu-repo> --dry-run   # confira
node design-system/scripts/install.mjs --target all --scope project --project <seu-repo>
```
`--scope global` instala para o usuário (escreve em `~`; peça aprovação). Detalhes e particularidades em `design-system/adapters/` (`claude-code.md`, `codex.md`, `antigravity.md`, `agents-md-snippet.md`).

## Uso rápido
1. `node design-system/scripts/scan-tokens.mjs <repo>` — varredura (valores fixos × tokens, nomenclatura, componentes).
2. A IA escreve o JSON do artefato (`references/artifacts.md`) e roda `node design-system/scripts/render-artifact.mjs audit audit.json`.
3. Abra `design-system/artifacts/audit-<nome>.html`.
Exemplo real (audit do `reels-motion-kit`): `design-system/examples/reels-kit/`.
