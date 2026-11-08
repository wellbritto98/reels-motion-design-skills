"""Passo 0 do tratamento prévio — DIAGNÓSTICO rápido do bruto (sem Whisper, ~segundos).

Mede pela energia do som quanto do vídeo é fala, quantas pausas longas existem e onde estão, e recomenda se vale cortar.

uso:  python scripts/corte/diagnostico.py public/source.mp4
saída: resumo na tela + work/diagnostico.json (pausas longas com tempo)
Regra de bolso (reel falado): pausa > 1,2 s ou ≥ 5 pausas/min acima de 0,5 s → CORTAR · 2–5/min → opcional · menos → limpo.
(O % de fala é só informativo: os respiros entre palavras contam como "não fala".)
Um vídeo que o apresentador já gravou "limpo" (sem hesitação nem respiro longo) pode pular o corte.
"""
import json, os, subprocess, sys, tempfile, wave
import numpy as np

video = sys.argv[1]
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.makedirs(os.path.join(root, "work"), exist_ok=True)
wav = os.path.join(tempfile.mkdtemp(), "a.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
w = wave.open(wav)
a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
WIN, HOP, SR = 480, 160, 16000
n = (len(a) - WIN) // HOP
f = np.fft.rfftfreq(WIN, 1 / SR); lo = (f > 80) & (f < 900); hi = (f > 2000) & (f < 7000)
q = np.lib.stride_tricks.sliding_window_view(a, WIN)[::HOP][:n]
db = 20 * np.log10(np.sqrt((q ** 2).mean(1)) + 1e-9)
X = np.abs(np.fft.rfft(q * np.hanning(WIN), axis=1)) ** 2
tilt = 10 * np.log10((X[:, lo].sum(1) + 1e-12) / (X[:, hi].sum(1) + 1e-12))
ref = np.percentile(db[db > -60], 90); off = ref - (-20.0)
sp = ((db > -33 + off) & (tilt > 12)) | ((db > -26 + off) & (tilt > 0))   # fala = volume E timbre (respiração fica de fora)

pausas, i = [], 0
while i < n:
    if not sp[i]:
        j = i
        while j < n and not sp[j]: j += 1
        d = (j - i) * 0.01
        if d > 0.35 and i > 0 and j < n:
            pausas.append({"de": round(i * 0.01, 2), "ate": round(j * 0.01, 2), "dur": round(d, 2)})
        i = j
    else:
        i += 1
dur = len(a) / SR
fala = float(sp.mean())
longas = [p for p in pausas if p["dur"] > 1.2]
tempo_pausa = sum(p["dur"] for p in pausas)
json.dump({"duracao": round(dur, 2), "fala_pct": round(fala * 100, 1), "pausas_maiores_que_0.35s": pausas}, open(os.path.join(root, "work", "diagnostico.json"), "w"), indent=1)
print(f"duração {dur:.1f}s · fala {fala*100:.0f}% do tempo · pausas > 0,35 s: {len(pausas)} (somam {tempo_pausa:.1f}s) · > 1,2 s: {len(longas)}")
for p in sorted(pausas, key=lambda p: -p["dur"])[:8]:
    print(f"  pausa de {p['dur']:.2f}s em {p['de']:.2f}–{p['ate']:.2f}s")
medias = [p for p in pausas if p["dur"] > 0.5]
por_min = len(medias) / max(dur / 60, 0.1)
print(f"pausas > 0,5 s: {len(medias)} ({por_min:.1f} por minuto)")
if longas or por_min >= 5:
    rec = "CORTAR antes de editar (tomadas → keeps → vícios → corte → conferir). Há pausas longas / hesitações de sobra."
elif por_min >= 2:
    rec = "OPCIONAL: ritmo natural de quem pensa falando. Corte se quiser ritmo de reel (fala densa); em vídeo longo ou aula, pode pular."
else:
    rec = "LIMPO: pode pular o corte e ir direto para a transcrição."
print("\nRECOMENDAÇÃO:", rec)
