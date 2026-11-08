# 08 · Imagens e SVG: livres de direitos ou com crédito na descrição

**Material real e rastreável.** Toda imagem usada tem origem, autor, licença e data registrados. Sem licença clara → não usa. Nunca invente logo,
print, capa ou número. Marca sem logo livre entra só como **texto**. Prefira **gráfico próprio** (barras, linhas, ícones) a uma foto genérica.

## Ordem de preferência
1. Gráfico/ícone próprio do kit (`library.tsx`) — zero licença.
2. **Domínio público / CC0** — sem crédito obrigatório (Wikimedia Commons PD/CC0, Smithsonian Open Access, The Met, Library of Congress, SVGRepo CC0/PD, Lucide/Tabler MIT).
3. **CC BY** — permitido; **crédito obrigatório na descrição do vídeo** (e, se couber, no canto da foto, como o `PhotoCard` faz).
4. **CC BY-SA** — só com `--allow-sa` e avisando o usuário (obras derivadas herdam a licença); prefira evitar.
5. Imagens do próprio apresentador/canal (peça ao usuário).
**Proibido:** NC (uso não comercial), ND se for editar/recolorir, "editorial use only", marca d'água, origem/licença incerta, print de site/app de terceiros sem permissão,
foto de pessoa privada, rosto de político/figura pública como "prova" sem necessidade editorial (use a foto do local/instituição).

## Ferramenta: `scripts/fetch_images.mjs`
```powershell
node scripts/fetch_images.mjs search "fachada Congresso Nacional"       # Commons: lista candidatos; RECUSA marca o que viola a regra
node scripts/fetch_images.mjs get "File:Fachada do Congresso Nacional (48079664402).jpg" congresso.jpg 1400
node scripts/fetch_images.mjs ov-search "brazilian real banknote"       # Openverse (agrega várias fontes livres)
node scripts/fetch_images.mjs ov-get <id> nota.jpg
node scripts/fetch_images.mjs credits                                    # bloco de créditos para colar na descrição
```
- **Antes de baixar, peça autorização ao usuário**: arquivo, fonte, licença, tamanho (~100–500 KB com largura 1400).
- Salva em `public/img/`, grava `public/img/credits.json` e regenera `CREDITOS.md`.
- O Commons limita requisições (resposta "too many requests"): o script espera 6 s entre chamadas; **não** rode em paralelo; se bloquear, espere 1–2 min.
- Abra o PNG baixado (`Read`) e **olhe**: é a imagem certa? o enquadramento aguenta corte 1000×340? há logos/pessoas que não deveriam estar?
- Tamanho: ≤ 1400 px de largura (o vídeo é 1080); notas/objetos pequenos (600 px) só em tamanho reduzido.

## Como citar
**Na descrição do vídeo** (cole o bloco do `credits`, só os itens CC BY/CC BY-SA):
```
Imagens: "Fachada do Congresso Nacional" — Senado Federal (CC BY 2.0) — https://commons.wikimedia.org/…
         "Trabalhadores da Hydro…" — Amazônia Real (CC BY 2.0) — https://commons.wikimedia.org/…
```
**Na legenda do post** (Instagram): uma linha curta "Fotos: Senado Federal, Amazônia Real (CC BY 2.0) — créditos completos na descrição/comentário fixado".
**No vídeo**: `credit: 'Foto: Senado Federal · CC BY 2.0'` no `PhotoCard` (já aparece no canto da imagem). PD/CC0 não exigem, mas citar é boa prática.

## SVG e ícones
Fontes: SVGRepo (confira a licença de cada item: CC0/PD/MIT), Openclipart (PD), Lucide/Tabler/Simple Icons (MIT/ISC — Simple Icons é para marcas: respeite
as diretrizes de uso da marca). Ao integrar: converta para componente React em `src/ui.tsx` (stroke `currentColor`/token do design system), simplifique
detalhes, **recolora com tokens** (`C.*`) e registre a origem em `CREDITOS.md`. Não use logos de terceiros sem permissão; prefira texto.

## Registro mínimo por imagem (já automático pelo script)
`arquivo · título · autor · licença · URL da página do item · exige crédito? · data`. Se baixou manualmente (usuário), crie a entrada em `public/img/credits.json`.

## Checklist antes do render
- [ ] Toda imagem de `public/img/` está em `credits.json`.
- [ ] Todas CC BY/BY-SA aparecem no bloco de créditos entregue ao usuário.
- [ ] Nenhuma imagem de pessoa privada; nenhum logo de terceiro; nenhuma licença NC/ND.
