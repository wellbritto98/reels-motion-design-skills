# SETUP — setup inicial para qualquer harness

Instruções para **uma IA executar** (Claude Code, Codex, Antigravity ou qualquer agente que leia arquivos e rode comandos) e para humanos. Tudo usa `node` sem dependências.
**Regra de ouro:** nada pesado é baixado ou instalado sem o usuário autorizar — mostre o plano (o quê, tamanho, origem) e espere o "sim". Nunca publique nem envie nada.

## 0 · Entender o pedido
| O usuário quer… | Skill | Ponto de entrada |
|---|---|---|
| editar um reel/short vertical de alguém falando, com motion graphics, legendas, sons | `reels-motion-kit` | `reels-motion-kit/SKILL.md` |
| auditar/documentar/estender/extrair o design system de um projeto | `design-system` | `design-system-skill/design-system/SKILL.md` |
Os dois se encontram: o design system dos vídeos do canal é o `design-system.json` do kit de reels; a skill `design-system` sabe auditá-lo.

## 1 · Diagnóstico (não instala nada)
```bash
node bootstrap.mjs check
```
Mostra `OK` / `FALTA` (com o comando exato para corrigir) / `AVISO` / `INFO` para Node ≥ 20, npm, git, ffmpeg+ffprobe, Python 3.9+, venv e modelos do Whisper, e quais skills já estão instaladas em cada agente.
Mínimo para **design-system**: só Node. Mínimo para **reels**: Node + ffmpeg (+ Python/Whisper para transcrever e cortar).

## 2 · Instalar as skills no seu harness
```bash
node bootstrap.mjs install-skills --target all --scope project --project <seu-repo> --dry-run   # confira o plano
node bootstrap.mjs install-skills --target all --scope project --project <seu-repo>             # instala
node bootstrap.mjs install-skills --target codex --scope global --skills design                 # exemplo: só uma skill, global (escreve em ~; peça aprovação)
```
Opções: `--target claude|codex|antigravity|all` · `--scope project|global` · `--skills reels,design|all` · `--force` para sobrescrever.
| Harness | Pasta no projeto | Pasta global | Invocação |
|---|---|---|---|
| Claude Code | `.claude/skills/<skill>/` | `~/.claude/skills/<skill>/` | `/design-system …` ou linguagem natural |
| Codex | `.agents/skills/<skill>/` | `~/.agents/skills/<skill>/` | linguagem natural (cite o nome da skill) |
| Antigravity | `.agents/skills/<skill>/` | `~/.gemini/config/skills/<skill>/` | `/<skill>` no App, ou automático pela `description` |
Caminhos conferidos nas docs oficiais em 08/11/2026 (Antigravity tem variantes legadas `.agent/skills`, `~/.gemini/antigravity/skills`, `~/.gemini/antigravity-cli/skills`; Codex ainda aceita `$CODEX_HOME/skills`). Reinicie a sessão do agente depois.
**Harness que não descobre skills sozinho** (ou versão antiga): copie o bloco de `design-system-skill/design-system/adapters/agents-md-snippet.md` para o `AGENTS.md`/`CLAUDE.md`/`GEMINI.md` do projeto — ele manda o agente **ler o `SKILL.md` com leitura de arquivo** e segui-lo. Neste repositório já existem `AGENTS.md`, `CLAUDE.md` e `GEMINI.md` na raiz com esse ponteiro.
Detalhes por agente: `design-system-skill/design-system/adapters/{claude-code,codex,antigravity}.md`.

## 3 · Dependências do kit de reels (só se for editar vídeo) — peça autorização
| Item | Como | Tamanho |
|---|---|---|
| ffmpeg + ffprobe | Windows `winget install Gyan.FFmpeg` · mac `brew install ffmpeg` · linux `sudo apt install ffmpeg` | ~100–200 MB |
| Python 3.9+ | Windows `winget install Python.Python.3.11` (nunca o alias da Microsoft Store) · mac `brew install python` · linux `apt install python3 python3-venv` | — |
| venv do Whisper (CPU) | `node bootstrap.mjs whisper-venv` (mostra o plano) → `node bootstrap.mjs whisper-venv --yes` | ~700 MB |
| Modelo do Whisper | baixa no 1º uso; **português = `small`/`medium`** (os `*.en` são só inglês) | small ≈ 461 MB · medium ≈ 1,5 GB |
| Chrome Headless Shell | o Remotion baixa no 1º still/render; ou aponte `REMOTION_BROWSER` para um existente | ~100 MB |
No Windows o venv deve ficar em caminho **curto** (`C:\wh\v`, padrão do bootstrap): caminhos longos quebram o pip/torch.

## 4 · Primeiro projeto de vídeo (smoke test, ~3 min)
```bash
node bootstrap.mjs new-project C:\reels\teste --install --demo      # copia o template, npm install, gera vídeo de teste, aplica o design system
cd C:\reels\teste
npm run typecheck                                                     # 0 erros
npm run ds:preview                                                    # prancha do design system → work/stills/DesignSystem_0.png
npm run stills -- 1 3 9 14                                            # quadros de teste → work/stills/
npm run render                                                        # (opcional) render de 24 s do demo → out/video.mp4
```
`new-project` sem flags só copia; `--install` roda `npm install` (internet); `--demo` gera o `source.mp4` sintético; `--design` aplica o design system sem instalar.
Abra os PNG para conferir (rosto/legenda/cartão aparecem) — só então diga que o ambiente está pronto.

## 5 · Checklist de "setup concluído"
- [ ] `node bootstrap.mjs check` sem nenhuma linha `FALTA` para o que o usuário vai usar.
- [ ] Skills instaladas no harness certo (e sessão reiniciada) **ou** ponteiro no `AGENTS.md`/`CLAUDE.md`/`GEMINI.md`.
- [ ] Reels: `npm run typecheck` e `npm run ds:preview` do projeto de teste passaram; o PNG foi aberto e conferido.
- [ ] Design system: `node design-system-skill/design-system/scripts/scan-tokens.mjs <projeto>` roda e imprime o resumo.
- [ ] O usuário sabe o que foi instalado, onde, e o que NÃO foi verificado.

## 6 · Problemas comuns
| Sintoma | Causa | Correção |
|---|---|---|
| `FALTA ffmpeg` depois de instalar | terminal antigo, PATH não atualizado | reabra o terminal |
| `OSError … licenses\…` no pip (Windows) | caminho do venv longo | venv em `C:\wh\v` |
| Transcrição sem sentido em português | modelo `*.en` | usar `small`/`medium` (multilíngue) |
| Skill não aparece no agente | sessão não reiniciada / pasta errada | reinicie; confira a tabela do passo 2; Antigravity CLI: `/skills` |
| `React error #310` no render | hook condicional num componente de inserção | chamar hooks sempre no topo (reels-motion-kit/references/06) |
| Python "não encontrado" no Windows | alias da Microsoft Store | instalar Python de verdade; `node scripts/py.mjs` escolhe o certo |
| Render muito lento | CPU fraca/pouca RAM | `CONCURRENCY=2`, vídeo curto primeiro, stills antes do render |
| `gh`/git pedem login | harness sem credenciais | o usuário faz o login; nunca peça tokens no chat |
