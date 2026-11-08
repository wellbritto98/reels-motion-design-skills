# Artefatos — o que a skill produz e como cada agente os entrega

**Artefato = arquivo.** Nada depende de ferramenta de um fornecedor: a IA escreve um JSON (esquemas abaixo), roda
`node scripts/render-artifact.mjs <tipo> <json>` e obtém, em `design-system/artifacts/`:
- `<tipo>-<nome>.html` — página **autocontida** (CSS inline, sem scripts nem fontes externas), tema claro/escuro (`prefers-color-scheme`), responsiva (gutter 16 px, sem rolagem horizontal da página; tabelas rolam dentro do card);
- `<tipo>-<nome>.md` — o mesmo conteúdo nos **formatos originais** (Summary / Naming Consistency / Token Coverage / Component Completeness / Priority Actions · Component: … · New Component: …).
Também ficam ali `scan.json` (varredura) e o JSON de entrada de cada artefato (rastreabilidade).

## Como cada agente entrega
| Agente | Entrega |
|---|---|
| **Claude Code** | Se a ferramenta `Artifact` existir: carregue a skill `artifact-design`, publique o `.html` como artefato (privado por padrão) e dê o link; senão, caminho do arquivo. O `.md` vai no repo. |
| **Codex** | Escreve os arquivos na pasta e informa os caminhos; para visualizar: `start design-system/artifacts/audit-x.html` (Windows) / `open` (mac) / `xdg-open` (linux). |
| **Antigravity** | Escreve os arquivos na pasta e cita os caminhos no resumo/walkthrough; o HTML abre no navegador do agente ou do usuário. Não presuma integração com o painel de artefatos do produto: confirme na sua versão. |
Em qualquer um: resumo curto no chat + caminhos. Nunca cole o relatório inteiro no chat.

## Esquemas de entrada (campos ausentes são omitidos — nunca invente)
### `audit`
```json
{ "title": "Audit — meu-app", "project": "meu-app", "date": "2026-11-08",
  "summary": {"components": 12, "issues": 31, "score": 62},
  "naming": [{"issue": "Prefixos de cor misturados", "components": ["Button","Badge"], "recommendation": "Adotar --color-*"}],
  "tokens": [{"category": "Colors", "defined": 18, "hardcoded": "42 usos / 14 hex distintos", "coverage": 55, "note": "…"}],
  "components": [{"name": "Button", "states": "ok", "variants": "ok", "docs": "warn", "score": 8}],
  "priorities": ["Criar tokens para os 14 hex mais repetidos (#ffc83d ×42) …"],
  "reviewPasses": [{"pass": "Acessibilidade", "findings": 7, "severity": "média", "notes": "…"}],
  "notes": "Subtotais: tokens 19/35 · nomes 9/15 · componentes 24/35 · docs 10/15. Amostrei 8 de 12 componentes." }
```
`states|variants|docs` ∈ `ok | warn | missing`.
### `component`
```json
{ "name": "Button", "description": "…quando usar…",
  "variants": [{"name": "primary", "useWhen": "ação principal da tela"}],
  "props": [{"name": "variant", "type": "'primary'|'ghost'", "default": "'primary'", "description": "…"}],
  "states": [{"state": "Hover", "visual": "usa --color-accent-hover", "behavior": "150 ms"}],
  "accessibility": {"role": "button (nativo)", "keyboard": "Tab foca; Enter/Espaço ativam", "screenReader": "anunciado pelo texto do botão"},
  "dos": ["Um primário por tela"], "donts": ["Usar ghost para ação destrutiva"],
  "code": {"lang": "tsx", "source": "<Button variant=\"primary\">Salvar</Button>"} }
```
### `extend`
```json
{ "name": "SegmentedControl", "problem": "…",
  "existing": [{"component": "Tabs", "similarity": "…", "whyNot": "…"}],
  "api": [{"name": "value", "type": "string", "default": "—", "description": "…"}],
  "variants": [{"name": "compact", "useWhen": "barra de filtros", "visual": "…"}],
  "states": [{"state": "Disabled", "behavior": "não interativo", "notes": "opacidade .5 + cursor not-allowed"}],
  "tokens": {"colors": ["--color-surface","--color-accent"], "spacing": ["--space-2"], "typography": ["--font-size-sm"]},
  "accessibility": {"role": "radiogroup", "keyboard": "setas movem a seleção", "screenReader": "…"},
  "openQuestions": ["Precisa de token --color-selected? sugestão: …"] }
```
### `extract`
```json
{ "title": "Tokens — marca X", "sources": ["src/styles/*.css", "https://site.com (CSS computado)"],
  "categories": [{"category": "Colors", "count": 24, "notes": "9 neutros, 5 marca, 4 semânticas"}],
  "palette": [{"name": "color-accent", "value": "#ffc83d"}],
  "gaps": ["Sem cores semânticas de aviso — decisão do usuário"],
  "inconsistencies": [{"issue": "Neutros de tons diferentes", "values": ["#eee","#efefef"], "where": "Button.css, Card.css", "suggestion": "unificar em --color-neutral-100 (confirmar)"}],
  "output": "design-system/tokens.extracted.css",
  "nextSteps": ["Revisar o arquivo de tokens com o usuário", "Rodar audit para medir a cobertura"] }
```

## Contrato do HTML (se você gerar um artefato à mão para algo fora destes tipos)
Autocontido; `<title>` de 2–4 palavras; cores como variáveis em `:root` com versão escura em `@media (prefers-color-scheme: dark)` **e** `[data-theme="dark"]`; `body` com fundo explícito;
layout de 1 coluna que funciona em 360 px com gutter de 16 px; sem scripts externos; sem dados do usuário embutidos além do necessário.
