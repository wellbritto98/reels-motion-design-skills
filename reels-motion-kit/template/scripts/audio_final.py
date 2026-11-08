"""Áudio final por loudnorm (alternativa ao finalize_audio.py): −14 LUFS integrado (±0,3), pico ≤ −1 dBTP, imagem sem recodificar.

Quando usar:
  - finalize_audio.py → quando a voz do bruto já tem bom volume e você só quer baixar os SFX e dar pico seguro (ganho único).
  - audio_final.py    → quando o volume geral precisa ser levado a um alvo (ex.: Reels/Shorts −14 LUFS). Faz loudnorm em duas
                        passadas (linear) + limitador e confere; se errar mais de 0,3 LU, corrige com ganho simples.
Uso:  python scripts/audio_final.py out/video_final.mp4 out/video_loudnorm.mp4 [--alvo -14]
Requer ffmpeg no PATH. Imprime a medição antes e depois.
"""
import argparse, json, os, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('entrada'); ap.add_argument('saida'); ap.add_argument('--alvo', type=float, default=-14.0)
a = ap.parse_args()


def medir(arq, extra=''):
    r = subprocess.run(['ffmpeg', '-v', 'info', '-nostats', '-i', arq, '-af', f'loudnorm=I={a.alvo}:TP=-1:LRA=11{extra}:print_format=json', '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='replace')
    txt = r.stderr
    return json.loads(txt[txt.rfind('{'):txt.rfind('}') + 1])


antes = medir(a.entrada)
print(f"antes : {antes['input_i']} LUFS · pico {antes['input_tp']} dBTP · LRA {antes['input_lra']}")
filtro = (f"loudnorm=I={a.alvo}:TP=-1:LRA=11:measured_I={antes['input_i']}:measured_TP={antes['input_tp']}:measured_LRA={antes['input_lra']}"
          f":measured_thresh={antes['input_thresh']}:offset={antes['target_offset']}:linear=true:print_format=summary,alimiter=limit=0.94:attack=3:release=60")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.entrada, '-af', filtro, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', a.saida], check=True)
depois = medir(a.saida)
print(f"depois: {depois['input_i']} LUFS · pico {depois['input_tp']} dBTP")
diff = round(a.alvo - float(depois['input_i']), 2)
if abs(diff) > 0.3:   # loudnorm linear pode errar ~0,5 LU
    tmp = os.path.splitext(a.saida)[0] + '-tmp.mp4'
    print(f'ajuste fino de {diff} dB')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.saida, '-af', f'volume={diff}dB,alimiter=limit=0.94:attack=3:release=60', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', tmp], check=True)
    os.replace(tmp, a.saida)
    final = medir(a.saida)
    print(f"final : {final['input_i']} LUFS · pico {final['input_tp']} dBTP")
print('pronto:', a.saida)
