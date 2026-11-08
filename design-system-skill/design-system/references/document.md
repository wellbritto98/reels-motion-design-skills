# Modo DOCUMENT — documentar um componente

Entrega: `component-<nome>.html/.md` com Descrição, Variantes, Props, Estados, Acessibilidade, Faça/Não faça e Exemplo de código.
**A documentação descreve o que o componente É no código**, não o que você acha que deveria ser. Divergência entre o ideal e o real vai para "Do's and Don'ts"
ou para o fim do artefato como recomendação — nunca misturada à descrição.

## Passo a passo
1. **Localize** o componente: `scan.components` (arquivo, props detectadas) ou busca por nome. Leia o arquivo inteiro, o CSS/estilos associados e os testes/stories se existirem.
2. **Descrição:** 1–2 frases: o que é e **quando usar** (e quando usar outro). Veja onde é usado de fato (`grep` do nome no repo): 2–3 usos reais mostram a intenção.
3. **Variantes:** valores reais de `variant/kind/tone/intent/size`. Para cada uma: "Use quando…" a partir do uso real. Variante nunca usada → marque "sem uso no repo".
4. **Props:** nome, tipo exato (TS), padrão (do destructuring/`defaultProps`), descrição. Props herdadas de elementos HTML (`...rest`) → uma linha "aceita props nativas de `<button>`". Frameworks:
   React/TS (`interface XProps`), Vue (`defineProps`), Svelte (`export let`), Angular (`@Input()`), web components (`@property`). Sem tipos → deduza do uso e diga que é inferido.
5. **Estados:** default, hover, active, focus, disabled, loading, error (os aplicáveis). Para cada: **visual** (qual token/estilo muda — cite o token) e **comportamento** (interação/animação). Estado inexistente que deveria existir → "não implementado" (e vira recomendação).
6. **Acessibilidade:** papel (`role` ou elemento nativo), teclado (Tab, Enter/Espaço, Esc, setas — o que o código realmente trata), leitor de tela (como é anunciado: nome acessível, `aria-*`), foco visível. Conferir contraste dos tokens usados (`tokens.md`).
7. **Faça / Não faça:** pares objetivos, derivados do código e do uso (ex.: "Faça: um primário por tela" · "Não faça: usar `variant="ghost"` para ação destrutiva"). Sem inventar regra de produto: o que for sugestão sua, marque "recomendação".
8. **Exemplo:** trecho **real** do repo (com caminho) ou mínimo e correto no framework do projeto. Rode mentalmente: compila com as props reais?
9. **JSON → artefato:** esquema `component` em `references/artifacts.md`; `node scripts/render-artifact.mjs component componente.json`.

## Qualidade
- Cada linha rastreável a um arquivo. Em dúvida: "não verificado".
- Tokens por nome, nunca por valor ("usa `--color-accent`", não "usa #ffc83d") — se o componente usa valor fixo, diga isso (é achado de audit).
- Vários componentes: um JSON/artefato por componente + um índice `README` curto se pedirem "documentar tudo" (priorize os mais usados; diga o que ficou de fora).
