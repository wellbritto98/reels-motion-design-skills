"""Peças comuns do TRATAMENTO PRÉVIO (corte): áudio 16 kHz, Whisper (Python ou whisper.cpp) e leitura de palavras.

Adaptado do motor de corte da skill `reel` (corte pelo som + vícios fora + J/L), com backend openai-whisper por padrão.

Variáveis de ambiente:
  WHISPER_BACKEND  python (padrão, pacote openai-whisper) | cpp (whisper-cli do whisper.cpp)
  WHISPER_MODEL    python: nome (tiny/base/small/medium/large) ou caminho de .pt  ·  cpp: caminho de ggml-*.bin
  WHISPER_LANG     código do idioma (padrão pt)
  WHISPER_DEVICE   cpu (padrão) | cuda
"""
import json, os, shutil, subprocess, sys, tempfile

LANG = os.environ.get("WHISPER_LANG", "pt")
# Prompt que faz o Whisper ESCREVER as hesitações (ele normalmente as apaga). Só use em trechos de keeps, nunca em janelas curtas.
PROMPT_VICIOS = "Éé, então, ããã, hum, é... tipo, éé, eh, ah, né, ããã, hum. Umm, éé."
PROMPT_NOMES = ""   # troque por vídeo com --prompt "Nome Próprio, Marca, Sigla"

MODELOS_CPP = [
    "~/.cache/whisper-cpp/ggml-large-v3-turbo.bin",
    "~/.cache/whisper-cpp/ggml-large-v3.bin",
    "~/.cache/whisper-cpp/ggml-medium.bin",
]


def backend():
    b = os.environ.get("WHISPER_BACKEND")
    if b:
        return b
    try:
        import whisper  # noqa: F401
        return "python"
    except ImportError:
        return "cpp"


def audio16k(video, wav):
    """Mono 16 kHz para análise e transcrição."""
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)


def recorte(wav, a, b, out):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", wav, out], check=True)


# ---------------------------------------------------------------- backend python (openai-whisper)
_cache = {}


def _py_model():
    if "m" not in _cache:
        import whisper
        nome = os.environ.get("WHISPER_MODEL", "small")
        if (nome.endswith(".en") or ".en." in os.path.basename(nome)) and LANG != "en":
            sys.exit(f'modelo "{nome}" é só inglês e o idioma é "{LANG}". Use small/medium (multilíngue).')
        _cache["m"] = whisper.load_model(nome, device=os.environ.get("WHISPER_DEVICE", "cpu"))
    return _cache["m"]


def _py_transcribe(wav, prompt, words):
    return _py_model().transcribe(wav, language=LANG, initial_prompt=prompt or None, word_timestamps=words,
                                  condition_on_previous_text=False, fp16=os.environ.get("WHISPER_DEVICE") == "cuda", verbose=None)


# ---------------------------------------------------------------- backend cpp (whisper.cpp)
def _cpp_modelo():
    m = os.environ.get("WHISPER_MODEL")
    for c in ([m] if m else MODELOS_CPP):
        p = os.path.expanduser(c)
        if os.path.exists(p):
            return p
    sys.exit("Modelo ggml do whisper.cpp não encontrado. Defina WHISPER_MODEL=/caminho/ggml-large-v3-turbo.bin")


def _cpp_bin():
    w = shutil.which("whisper-cli") or shutil.which("whisper-cpp") or shutil.which("main")
    if not w:
        sys.exit("whisper-cli não encontrado (use WHISPER_BACKEND=python com openai-whisper, ou instale o whisper.cpp).")
    return w


def _dtw(caminho):
    nome = os.path.basename(caminho).replace("ggml-", "").replace(".bin", "").split("-q")[0]
    return {"large-v3-turbo": "large.v3.turbo", "large-v3": "large.v3", "large-v2": "large.v2", "medium": "medium", "small": "small", "base": "base", "tiny": "tiny"}.get(nome)


def rapido():
    """Modo rápido (padrão no backend python): UMA transcrição do áudio inteiro, reaproveitada por trecho/keep/emenda.
    O modo por trecho do motor original (--por-trecho) transcreve cada janela sozinha: mais fiel contra repetição escondida,
    mas em CPU custa ~30 s por janela. Use-o só em emendas suspeitas, ou com whisper.cpp / GPU."""
    return backend() == "python" and "--por-trecho" not in sys.argv


def palavras_cache(wav, prompt, cache_path):
    """palavras() do áudio inteiro, guardadas em cache_path (JSON) para as outras etapas não repetirem."""
    if os.path.exists(cache_path):
        return [tuple(x) for x in json.load(open(cache_path, encoding="utf-8"))]
    ws = palavras(wav, prompt)
    json.dump(ws, open(cache_path, "w", encoding="utf-8"), ensure_ascii=False)
    return ws


# ---------------------------------------------------------------- API única
def texto(wav, prompt=None):
    """Transcrição corrida (sem tempos) — para LER o que foi dito num trecho."""
    if backend() == "python":
        return " ".join(_py_transcribe(wav, prompt, False)["text"].split())
    cmd = [_cpp_bin(), "-m", _cpp_modelo(), "-f", wav, "-l", LANG, "-nt", "-np"] + (["--prompt", prompt] if prompt else [])
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    return " ".join(r.stdout.split())


def palavras(wav, prompt=None, deslocamento=0.0):
    """Palavra a palavra com tempos: [(inicio, fim, texto)], somando `deslocamento` (tempo do trecho na fonte)."""
    out = []
    if backend() == "python":
        r = _py_transcribe(wav, prompt, True)
        for s in r["segments"]:
            for w in s.get("words", []):
                t = w["word"].strip()
                if t:
                    out.append((round(deslocamento + float(w["start"]), 3), round(deslocamento + float(w["end"]), 3), t))
        return out
    m = _cpp_modelo()
    with tempfile.TemporaryDirectory() as d:
        base = os.path.join(d, "w")
        cmd = [_cpp_bin(), "-m", m, "-f", wav, "-l", LANG, "-ojf", "-ml", "1", "-sow", "-of", base, "-np"]
        if _dtw(m):
            cmd += ["-dtw", _dtw(m)]
        if prompt:
            cmd += ["--prompt", prompt]
        subprocess.run(cmd, capture_output=True)
        dados = json.load(open(base + ".json", encoding="utf-8"))
    for s in dados["transcription"]:
        t = s["text"].strip()
        if t:
            out.append((round(deslocamento + s["offsets"]["from"] / 1000, 3), round(deslocamento + s["offsets"]["to"] / 1000, 3), t))
    return out
