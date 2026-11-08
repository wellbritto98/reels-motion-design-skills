# 01 · Setup do ambiente (para a IA executar, na ordem)

Meta: `node scripts/check_env.mjs` sem nenhuma linha FALTA. **Peça autorização antes de instalar/baixar** (diga o que e o tamanho).
Comandos Windows (PowerShell) primeiro, macOS/Linux entre parênteses. Nunca use o alias `python` da Microsoft Store.

## 1. Node.js ≥ 20
`node -v`. Falta → `winget install OpenJS.NodeJS.LTS` (mac: `brew install node`).

## 2. ffmpeg + ffprobe
`ffmpeg -version`. Falta → `winget install Gyan.FFmpeg` (mac: `brew install ffmpeg` · linux: `sudo apt install ffmpeg`).
Reabra o terminal depois. Usos no kit: extrair áudio 16 kHz, cortar/concatenar (tratamento prévio), medir LUFS/pico,
remuxar áudio final, contact sheets (`ffmpeg -ss T -i v.mp4 -frames:v 1 f.png`).

## 3. Python 3.9+ com Whisper (só para transcrever e cortar)
**Crie o venv em caminho CURTO** — no Windows o pip falha com caminhos longos (`OSError: [Errno 2] ... \torch-…dist-info\licenses\…`):
```powershell
mkdir C:\wh; cd C:\wh; python -m venv v
C:\wh\v\Scripts\python -m pip install --upgrade pip
C:\wh\v\Scripts\python -m pip install torch --index-url https://download.pytorch.org/whl/cpu   # CPU: ~200 MB (com GPU NVIDIA use o índice cu12x)
C:\wh\v\Scripts\python -m pip install openai-whisper
C:\wh\v\Scripts\python -c "import torch, whisper; print('ok', torch.__version__)"
```
(mac/linux: `python3 -m venv ~/.venvs/whisper && ~/.venvs/whisper/bin/pip install torch openai-whisper`.)
Use sempre esse Python (`C:\wh\v\Scripts\python`) para `scripts/transcribe.py` e `scripts/corte/*.py`. No Windows exporte `PYTHONUTF8=1`.

### Modelos do Whisper (arquivos `.pt` em `~/.cache/whisper/`)
| Modelo | Tamanho | Quando |
|---|---|---|
| `small` | ≈ 461 MB | padrão multilíngue; ~9 min de áudio em ~4–5 min na CPU |
| `medium` | ≈ 1,5 GB | mais exato em nomes/siglas; ~3× mais lento |
| `large` | ≈ 3 GB | só com GPU |
| `*.en` | — | **só inglês**: com vídeo em português gera lixo. Verifique o idioma do vídeo ANTES. |
O 1º uso baixa o modelo escolhido de `openaipublic.azureedge.net`. **Pergunte antes** (nome + tamanho). Se o usuário já tem um `.pt`,
passe o caminho em `--model`.

Alternativa mais rápida (opcional): `whisper.cpp` (`whisper-cli` + `ggml-large-v3-turbo.bin`) — o módulo de corte aceita
`WHISPER_BACKEND=cpp` + `WHISPER_MODEL=<ggml.bin>`. Só vale a pena em vídeos longos ou com muitos cortes.

## 4. Projeto Remotion
```powershell
cd C:\reels\<slug>        # cópia do template, caminho curto
npm install               # remotion 4.0.534 + @remotion/{cli,bundler,renderer,media,google-fonts}
node scripts/make_demo_source.mjs     # só para smoke test, se ainda não tem vídeo
npm run design            # gera src/brand.generated.ts a partir do design-system.json
npm run typecheck         # deve passar limpo
npm run ds:preview        # 1º uso: o Remotion baixa o Chrome Headless Shell (~100 MB) se não achar um
npm run stills -- 3 8 15  # PNGs em work/stills/
```
Navegador: se já existe um `chrome-headless-shell` (ex.: de outro projeto Remotion em `node_modules/.remotion/`), aponte
`REMOTION_BROWSER` para o `.exe` e evite o download. Concurrency do render: `CONCURRENCY=4` (≈ metade dos núcleos, ≤ 6).

## 5. Variáveis úteis
| Variável | Para quê |
|---|---|
| `REMOTION_BROWSER` | caminho do chrome-headless-shell (stills e render) |
| `CONCURRENCY` | processos do render (padrão 4) |
| `PYTHONUTF8=1` | Python no Windows lê/escreve UTF-8 (acentos) |
| `WHISPER_BACKEND/MODEL/LANG/DEVICE` | módulo de corte (`scripts/corte/comum.py`) |

## 6. Armadilhas de ambiente já vistas
- **pip + caminho longo no Windows** → venv em `C:\wh\v`.
- **Saída JSON do Whisper com acentos "estranhos"** quando gravada pelo Python do Windows sem UTF-8 → `PYTHONUTF8=1` (os scripts do kit já gravam em UTF-8).
- **`/tmp` no Git Bash ≠ `/tmp` do Node** → use caminhos relativos ao projeto ou a pasta `work/`.
- **Heredocs longos no shell** podem quebrar em Windows → grave arquivos com a ferramenta de escrita de arquivos, não com `cat <<EOF`.
- **Render de 30–45 min estourando timeout** → rode em segundo plano e espere pela notificação; não faça polling com `sleep`.
- **Sem GPU:** nada no kit exige GPU. Whisper `small` e Remotion rodam em CPU.

## 7. Atalho para rodar os scripts Python
`node scripts/py.mjs scripts/transcribe.py …` (ou `npm run py -- scripts/corte/diagnostico.py public/source.mp4`) escolhe sozinho o Python certo
(`$KIT_PYTHON`, `C:\wh\v\Scripts\python.exe`, `~/.venvs/whisper/bin/python`, `python3`, `python`, `py`) e liga `PYTHONUTF8=1`. Use-o em vez de `python …` solto.
