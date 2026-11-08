"""Passo 2 — transcrição que NÃO esconde vícios ("éé", "ããã", "hum"), só dentro dos keeps escolhidos.

O Whisper normalmente apaga hesitações; com um prompt cheio delas ele passa a escrevê-las, e o corte (corte.py) consegue tirar
cada uma — é assim que somem as pausas de "é..." de quem está lembrando o que vai dizer. Transcrever por keep (e não o vídeo
inteiro) evita o texto inventado nos silêncios longos.

uso:  python scripts/corte/vicios.py work/corte        (lê PASTA/keeps.json e PASTA/audio16k.wav)
saída: PASTA/vicios/k{i}.json  (palavras com tempo da FONTE) e o texto de cada keep na tela
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import recorte, palavras, palavras_cache, rapido, PROMPT_VICIOS

P = sys.argv[1]
keeps = json.load(open(f"{P}/keeps.json", encoding="utf-8"))["keeps"]
os.makedirs(f"{P}/vicios", exist_ok=True)
tmp = f"{P}/_keep.wav"
full = palavras_cache(f"{P}/audio16k.wav", PROMPT_VICIOS, f"{P}/_cache_full.json") if rapido() else None
for i, k in enumerate(keeps):
    if full is not None:   # modo rápido: recorta a transcrição única (já tem os tempos da FONTE)
        ws = [x for x in full if k["from"] - 0.05 <= (x[0] + x[1]) / 2 <= k["to"] + 0.05]
    else:
        recorte(f"{P}/audio16k.wav", k["from"], k["to"], tmp)
        ws = palavras(tmp, PROMPT_VICIOS, deslocamento=k["from"])
    json.dump(ws, open(f"{P}/vicios/k{i}.json", "w", encoding="utf-8"), ensure_ascii=False)
    print(f"[{i}] {k['from']:.2f}-{k['to']:.2f} {k.get('why', '')}\n    " + " ".join(f"{t}({a:.2f})" for a, b, t in ws) + "\n", flush=True)
if os.path.exists(tmp):
    os.remove(tmp)
