# Adaptador — Google Antigravity (App, IDE e CLI)

## Instalação (verificada em antigravity.google/docs/skills e no codelab oficial, 08/11/2026)
Skill = pasta com `SKILL.md` (`description` obrigatório; `name` opcional, minúsculas com hífen; se faltar, vale o nome da pasta). Locais:
- **Projeto (todas as superfícies):** `<raiz>/.agents/skills/<skill>/` — versionável; o Antigravity também lê `.agents/skills/` de pastas-pai até a raiz do repo. `.agent/skills` (singular) ainda funciona por compatibilidade.
- **Global (App, CLI, IDE):** `~/.gemini/config/skills/<skill>/`.
- **Só CLI:** `~/.gemini/antigravity-cli/skills/` e `~/.gemini/skills/` · **só IDE (legado):** `~/.gemini/antigravity/skills/`.
- `npx skills` instala em `~/.agents/skills` (o Antigravity lê; o CLI, não).
```bash
node scripts/install.mjs --target antigravity --scope project --project <repo>   # → <repo>/.agents/skills/design-system (o mesmo destino do Codex)
node scripts/install.mjs --target antigravity --scope global                    # → ~/.gemini/config/skills/design-system
```
Subpastas aceitas: `scripts/` (executáveis), `examples/`, `resources/` (templates/dados). Esta skill usa `scripts/`, `references/`, `adapters/`, `examples/`.
**Dica oficial:** trate scripts como caixa-preta — rode `node scripts/scan-tokens.mjs --help` antes de ler o código-fonte. Esta skill segue isso (todos os scripts têm `--help`).

## Como invocar
- **Automático:** o agente casa o pedido com a `description` (carrega só nome+descrição no início; abre o `SKILL.md` ao ativar; depois executa).
- **Manual no App:** `/design-system` (o `/<nome-da-skill>` invoca a skill). Argumentos em texto livre: `/design-system audit`, `/design-system document Button`.
- **CLI:** `/skills` lista as instaladas.
- **Workflows/Rules (opcional):** workflows (`.agents/workflows/`) orquestram skills por comando; rules (`.agents/rules/`) são guardrails sempre ativos. Para forçar o uso: uma rule curta
  "Em pedidos de auditoria/documentação de design system, use a skill design-system" (modelo em `adapters/agents-md-snippet.md`). Confirme caminhos na sua versão — as docs divergem entre App, IDE e CLI.

## Particularidades
- **Artefatos:** esta skill gera **arquivos** (`design-system/artifacts/*.html|.md`). Cite os caminhos no resumo/walkthrough e abra o HTML no navegador do agente ou do usuário. Não presuma que o painel de "Artifacts" do produto os indexa automaticamente; verifique na sua versão.
- **Navegador do agente:** use-o para renderizar o `.html` e os componentes (contraste, foco, claro/escuro) — mais fiel que raciocinar pelo código.
- **Multi-agente:** se o Manager permitir agentes paralelos, os 4 passes de revisão podem rodar em paralelo; senão, sequencial.
- **Permissões:** o scan só lê. Gravar em `design-system/artifacts/` é seguro; `--scope global` do instalador escreve em `~/.gemini` (peça aprovação).
