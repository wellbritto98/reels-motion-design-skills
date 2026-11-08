# Adaptador — Claude Code (CLI, app desktop, IDE) e Claude.ai

## Instalação
Skill = pasta com `SKILL.md`. Locais: **projeto** `<repo>/.claude/skills/design-system/` · **global** `~/.claude/skills/design-system/`.
```bash
node scripts/install.mjs --target claude --scope project --project <repo>
node scripts/install.mjs --target claude --scope global
```
(No Windows global: `C:\Users\<você>\.claude\skills\design-system\`.) Reinicie a sessão. Também funciona como plugin (`skills/design-system/SKILL.md`).
Se o repo também é usado por Codex/Antigravity, rode `--target all` (cobre `.claude/skills` **e** `.agents/skills`).

## Como invocar
- **Barra:** `/design-system audit`, `/design-system document Button`, `/design-system extend SegmentedControl`, `/design-system extract`.
- **Natural:** "audita o design system" — a `description` aciona a skill.
- Se existir também o comando `/design:design-system` de um plugin, os dois coexistem: o desta pasta é independente (não precisa do plugin, dos conectores nem de rede).

## Artefatos no Claude
1. Gere o JSON e rode `render-artifact.mjs` (cria `.html` + `.md`).
2. Se a ferramenta **`Artifact`** estiver disponível: carregue a skill `artifact-design` e publique o `.html` (privado por padrão; o artefato não depende de scripts externos, então segue o contrato de página). Dê o link. Atualizações: republique o mesmo caminho.
3. Sem a ferramenta (Claude Code no terminal sem artefatos, ou conta sem o recurso): entregue os caminhos dos arquivos. O `.md` serve para colar em wiki/Notion; o `.html` abre no navegador.
4. Documento "de texto" para o time continuar editando (ex.: guia do sistema)? Prefira o `.md` ou, se houver conector de docs, o doc — não o HTML.

## Particularidades
- **Subagentes:** os passes de `references/review-passes.md` podem rodar em paralelo (um subagente por passe, cada um devolvendo o bloco de `reviewPasses[]`). Passe o caminho da skill e do escopo; peça só achados com arquivo:linha.
- **Conectores:** com Figma (MCP) conectado, audite nomes/variantes direto no arquivo; com Notion/wiki, **só publique se o usuário pedir**.
- **Navegador:** o navegador embutido/Chrome do Claude pode abrir o `.html` (`file://`) para conferir visual, claro/escuro e mobile (largura 375).
- **Memória/regras do usuário:** instruções do `CLAUDE.md`/AGENTS.md do projeto prevalecem sobre preferências desta skill (ex.: idioma, convenções de pasta).
