"""Pós-render do áudio: recupera só os efeitos (saída − fonte), remixa mais baixo e com pico seguro, e remuxa no vídeo.

Por que: o render mistura voz + SFX. Como a voz da saída é idêntica à da fonte, (saída − fonte) = só os SFX. Assim dá para
corrigir o volume dos efeitos e o pico SEM renderizar de novo (40 min). Ganho único, sem limitador/compressor.

Uso:  python scripts/finalize_audio.py [--sfx 0.8] [--peak -1.5]
Entrada: out/video.mp4 e public/source.mp4   Saída: out/video_final.mp4
Requer: ffmpeg no PATH e numpy (qualquer venv serve).
"""
import argparse, subprocess, wave, os, sys
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('--sfx', type=float, default=0.8, help='multiplicador dos efeitos (1.0 = como renderizado)')
ap.add_argument('--peak', type=float, default=-1.5, help='pico alvo em dBFS aplicado como ganho único')
ap.add_argument('--out', default='out/video_final.mp4')
a = ap.parse_args()

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
os.makedirs('work', exist_ok=True)

def extract(src, dst):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-vn', '-ac', '2', '-ar', '44100', dst], check=True)

def read(p):
    w = wave.open(p)
    return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32).reshape(-1, w.getnchannels()) / 32768

extract('out/video.mp4', 'work/out_s.wav')
extract('public/source.mp4', 'work/src_s.wav')
o, s = read('work/out_s.wav'), read('work/src_s.wav')
n = min(len(o), len(s)); o, s = o[:n], s[:n]
d = o - s
# porta de ruído: tira o ruído de codec AAC onde não há efeito
env = np.convolve(np.abs(d).max(axis=1), np.ones(441) / 441, mode='same')
gate = np.convolve((env > 0.0035).astype(np.float32), np.ones(2205) / 2205, mode='same')
gate = np.clip(gate * 1.5, 0, 1)[:, None]
mix = s + a.sfx * d * gate
peak = float(np.abs(mix).max())
gain = (10 ** (a.peak / 20)) / peak
mix = np.clip(mix * gain, -1, 1)
print(f'pico antes {20*np.log10(peak):.2f} dBFS -> ganho {20*np.log10(gain):.2f} dB (alvo {a.peak} dBFS)')
w = wave.open('work/final_mix.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(44100)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'out/video.mp4', '-i', 'work/final_mix.wav', '-map', '0:v', '-map', '1:a',
                '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', a.out], check=True)
r = subprocess.run(['ffmpeg', '-nostats', '-i', a.out, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
for line in r.stderr.splitlines()[-14:]:
    if any(k in line for k in ('I:', 'LRA:', 'Peak:')):
        print(line.strip())
print('pronto:', a.out)
