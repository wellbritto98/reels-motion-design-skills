"""Transcreve o vídeo com Whisper, com tempo por palavra.

Uso:
  python scripts/transcribe.py public/source.mp4 --lang pt --model small
  python scripts/transcribe.py public/source.mp4 --lang pt --model small --prompt "Economia, PEC, CLT, FGTS, INSS, João Victor"

Saída (UTF-8, sempre):
  work/words_raw.json   [{"t": "palavra,", "s": 1.23, "e": 1.58}, ...]   ← entrada do fix_words.mjs
  work/transcript.txt   uma linha por segmento com [início-fim] — leia isto para ENTENDER o vídeo
  work/audio.wav        áudio 16 kHz mono

Modelos: *.en = só inglês (NÃO use em português). small ≈ 461 MB (bom custo/benefício), medium ≈ 1,5 GB (mais exato, ~3x mais lento),
large ≈ 3 GB (precisa de GPU). Rodar em CPU: small transcreve ~9 min de áudio em ~4-5 min.
O primeiro uso baixa o modelo para ~/.cache/whisper — PEÇA AUTORIZAÇÃO ao usuário antes (tamanho + origem: openaipublic.azureedge.net).
Se o modelo já existir como arquivo .pt, passe o caminho em --model.
"""
import argparse, json, os, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('video')
ap.add_argument('--lang', default='pt')
ap.add_argument('--model', default='small')
ap.add_argument('--prompt', default=None, help='vocabulário/nomes próprios para guiar o Whisper (melhora siglas e nomes)')
ap.add_argument('--device', default='cpu', choices=['cpu', 'cuda'])
a = ap.parse_args()

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
work = os.path.join(root, 'work')
os.makedirs(work, exist_ok=True)
wav = os.path.join(work, 'audio.wav')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', a.video, '-vn', '-ac', '1', '-ar', '16000', wav], check=True)

try:
    import whisper
except ImportError:
    sys.exit('openai-whisper não instalado neste Python. Veja references/01-setup.md §Python (venv curto + torch CPU + openai-whisper).')

if a.model.endswith('.en') or '.en.' in os.path.basename(a.model):
    if a.lang != 'en':
        sys.exit(f'modelo "{a.model}" é só inglês, mas --lang={a.lang}. Use small/medium (multilíngue).')

model = whisper.load_model(a.model, device=a.device)
r = model.transcribe(wav, word_timestamps=True, language=a.lang, fp16=(a.device == 'cuda'), verbose=False, initial_prompt=a.prompt, condition_on_previous_text=False)

words = [{'t': w['word'].strip(), 's': round(float(w['start']), 2), 'e': round(float(w['end']), 2)} for s in r['segments'] for w in s['words']]
with open(os.path.join(work, 'words_raw.json'), 'w', encoding='utf-8') as f:
    json.dump(words, f, ensure_ascii=False)
with open(os.path.join(work, 'transcript.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join('[%.1f-%.1f] %s' % (s['start'], s['end'], s['text'].strip()) for s in r['segments']))
print(f'{len(words)} palavras · {len(r["segments"])} segmentos -> work/words_raw.json, work/transcript.txt')
