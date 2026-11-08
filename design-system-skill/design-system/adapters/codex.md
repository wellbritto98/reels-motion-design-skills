# Adaptador — OpenAI Codex (CLI / app / IDE)

## Instalação (verificada no código aberto do Codex, `codex-rs/ext/skills`, e na documentação do Context7)
O Codex descobre skills (pasta com `SKILL.md`, frontmatter `name` + `description`) em:
- **Projeto:** `<repo>/.agents/skills/<skill>/` — e também em cada `.agents/skills` entre a raiz do repo e o diretório atual; ou `<repo>/.codex/skills/`.
- **Usuário (global):** `~/.agents/skills/<skill>/` (o `$CODEX_HOME/skills` ainda funciona, mas é legado).
```bash
node scripts/install.mjs --target codex --scope project --project <repo>      # → <repo>/.agents/skills/design-system
node scripts/install.mjs --target codex --scope global                       # → ~/.agents/skills/design-system
```
Estrutura opcional do Codex: `agents/openai.yaml` (metadados de UI e política de invocação), `scripts/`, `references/`, `assets/` — esta skill já usa `scripts/` e `references/`.
Reinicie a sessão para redescobrir.

## Como invocar
- Descreva o pedido ("audite o design system deste repo", "documente o componente Button", "extraia os tokens"): a `description` casa e o Codex abre o `SKILL.md`.
- Para forçar, cite o nome da skill no prompt (a sintaxe `$design-system` existe nas versões com seleção de skills; confirme com o comando de listagem da sua versão).
- **Sem barra `/design-system`:** o Codex não define comandos de skill arbitrários. Use linguagem natural ou os atalhos acima.

## Fallback quando a skill não é descoberta (repos antigos, versões sem skills)
Cole no `AGENTS.md` do repo (o Codex lê `AGENTS.md` automaticamente) — o arquivo `adapters/agents-md-snippet.md` tem o bloco pronto. Ele manda o Codex **ler `design-system/SKILL.md` com leitura de arquivo** e seguir.
O Codex não tem ferramenta de "invocar skill": carregar = ler o arquivo. As skills são documentos de procedimento, não ferramentas.

## Particularidades do Codex
- **Sem subagentes paralelos:** rode os passes de `references/review-passes.md` **em sequência**, no mesmo agente.
- **Sandbox/aprovação:** `scan-tokens.mjs` só lê; `render-artifact.mjs` escreve em `design-system/artifacts/`; `install.mjs --scope global` escreve em `~` e **exige aprovação** — peça ao usuário rodar ou autorizar.
- **Verificação visual:** se o Codex tiver Playwright/chrome-devtools/browser tool, abra o `.html` gerado e confira (sem rolagem horizontal, contraste, claro/escuro). Sem navegador: diga que não foi renderizado.
- **Artefatos:** arquivos em `design-system/artifacts/`; informe os caminhos. Abrir: `start <arquivo>` (Windows), `open` (mac), `xdg-open` (linux).
- **Windows:** use `node scripts/...` (não depende de bash). Caminhos com espaços entre aspas.
