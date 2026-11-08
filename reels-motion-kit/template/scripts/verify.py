"""Checklist de ENTREGA: mede o vídeo final e escreve VERIFY.md com o que passou e o que só o olho confere.

Uso:  python scripts/verify.py out/video_final.mp4 [--sfx-count 34] [--lufs -14] [--tol 1.0] [--max-pause 0.35]
Mede: resolução 1080×1920, fps, duração, LUFS integrado e pico (dBTP), pausas na voz acima do limite (silencedetect),
densidade de SFX (se informar --sfx-count; get em src/content/timeline.ts: SFX_CUES.length). Sai com código 1 se algo medido reprovou.
"""
import argparse, datetime, json, os, re, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('video')
ap.add_argument('--sfx-count', type=int, default=None)
ap.add_argument('--lufs', type=float, default=None, help='alvo de loudness (padrão: só informa; Reels/Shorts costumam usar -14)')
ap.add_argument('--tol', type=float, default=1.0)
ap.add_argument('--max-pause', type=float, default=0.35)
a = ap.parse_args()
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height,r_frame_rate,codec_type:format=duration', '-of', 'json', a.video], capture_output=True, text=True).stdout)
vs = next(s for s in pr['streams'] if s['codec_type'] == 'video')
n, d = vs['r_frame_rate'].split('/')
fps = float(n) / float(d)
dur = float(pr['format']['duration'])
has_audio = any(s['codec_type'] == 'audio' for s in pr['streams'])

e = subprocess.run(['ffmpeg', '-nostats', '-i', a.video, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
tail = e[e.rfind('Summary'):]
lufs = float(re.search(r'I:\s+(-?[\d.]+) LUFS', tail).group(1))
peak = float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', tail).group(1))
sil = subprocess.run(['ffmpeg', '-hide_banner', '-i', a.video, '-af', f'silencedetect=noise=-38dB:d={a.max_pause}', '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
pausas = [float(x) for x in re.findall(r'silence_duration: ([\d.]+)', sil)]
# a última "pausa" costuma ser o fim do vídeo; mostramos todas e o usuário julga
itens = [
    ('Resolução 1080×1920', vs['width'] == 1080 and vs['height'] == 1920, f"{vs['width']}×{vs['height']}"),
    ('Faixa de áudio presente', has_audio, ''),
    ('Duração', True, f'{dur:.1f} s · {fps:.2f} fps'),
    ('Pico ≤ −1 dBFS (sem estouro)', peak <= -0.9, f'{peak} dBFS'),
    (f'Loudness {"≈ " + str(a.lufs) + " LUFS" if a.lufs is not None else "(informativo)"}', a.lufs is None or abs(lufs - a.lufs) <= a.tol, f'{lufs} LUFS'),
    (f'Sem pausas > {a.max_pause} s na voz', len(pausas) == 0, f'{len(pausas)} pausa(s): ' + ', '.join(f'{p:.2f}s' for p in pausas[:6]) if pausas else 'nenhuma'),
]
if a.sfx_count is not None:
    dens = a.sfx_count / max(dur, 1)
    itens.append(('SFX ≤ 0,85 por segundo', dens <= 0.85, f'{a.sfx_count} efeitos · {dens:.2f}/s'))
ok = all(i[1] for i in itens)
L = [f'# VERIFY · {os.path.basename(a.video)}', f'*{datetime.datetime.now():%Y-%m-%d %H:%M}*', '', '## Medido', '| Item | Resultado | Detalhe |', '|---|---|---|']
L += [f"| {nome} | {'✅' if p else '❌'} | {det} |" for nome, p, det in itens]
L += ['', '## Conferido no olho (marque)',
      '- [ ] O apresentador está em quadro em TODOS os quadros (nenhum cartão cobre o rosto)',
      '- [ ] Texto legível, nada cortado nas bordas, ≥ 2 s de leitura em telas com texto',
      '- [ ] Legenda com o texto certo (nomes próprios, siglas, números) — corrigida em content-fixes/word-fixes.json',
      '- [ ] Todo número/gráfico bate com o que foi dito (ou está atribuído: "Afirmação do apresentador")',
      '- [ ] Imagens de terceiros: licença registrada em CREDITOS.md; créditos CC BY copiados para a descrição',
      '- [ ] Zona segura de Reels: texto/UI importantes em x 90–990, y 220–1520 (fora da coluna de botões x>940, y>1150)',
      '- [ ] Ouvi o vídeo inteiro com som (SFX não cobrem a voz; nada estoura)',
      '', f"**Resultado medido: {'APROVADO' if ok else 'REPROVADO'}** · nunca publicar nem enviar o vídeo sem o usuário pedir."]
open(os.path.join(root, 'VERIFY.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print('\n'.join(L))
sys.exit(0 if ok else 1)
