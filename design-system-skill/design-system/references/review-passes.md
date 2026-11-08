# Passes de revisão (opcionais no audit; úteis antes de entregar UI)

Inspirados nos passes do repositório MIT [Trystan-SA/claude-design-system-prompt](https://github.com/Trystan-SA/claude-design-system-prompt) (redação própria; o
README dele diz que é derivado do Claude Design — não verificado). Cada passe lê o código/HTML real, lista achados com **severidade** (`alta` = bloqueia uso ·
`média` = degrada · `baixa` = polimento) e **confiança**, e fecha com o que foi corrigido, o que ficou e o que é falso positivo.

**Execução por agente:** Claude Code pode rodar os passes em paralelo com subagentes. **Codex e Antigravity: rode em sequência**, no mesmo agente.
Se houver navegador headless (Playwright, chrome-devtools, ferramenta de browser do agente), **renderize e confira** contraste/foco de verdade;
sem navegador, raciocine pelo código e marque "não renderizado".

## 1. Acessibilidade (alvo WCAG 2.1 AA, salvo pedido)
- **Contraste:** texto normal ≥ 4,5:1, texto grande (≥ 24 px ou 18,66 px negrito) e componentes de UI ≥ 3:1. Cor nunca é o único sinal (erro/sucesso). Atenção a pares vermelho/verde.
- **Semântica:** um `h1`; hierarquia de títulos sem saltos; `button`/`a` nativos em vez de `div` clicável; `alt` significativo (ou vazio se decorativa); `label` real nos campos; ARIA só quando o nativo não resolve.
- **Teclado e foco:** tudo acionável por teclado, ordem = leitura; foco **visível** com contraste (nunca `outline:none` sem substituto); modais/menus com Esc, setas e armadilha de foco corretas.
- **Movimento e formulários:** respeitar `prefers-reduced-motion`; nada pisca > 3×/s; erros específicos ligados ao campo; obrigatoriedade não só por cor; `type`/`autocomplete` adequados; alvos de toque ≥ 44×44 px.

## 2. Estados de interação
Inventarie cada elemento interativo e verifique: **default** (parece clicável sem hover) · **hover** (muda de forma perceptível; reduzir só opacidade parece "desabilitado") ·
**active/pressed** · **disabled** (claramente indisponível, sem hover, diz por quê quando for por condição) · **focus** (visível) · **loading** (bloqueia clique repetido,
spinner/label, restaura ao fim). Transições 150–300 ms para hover/focus/press. Todo ato gera feedback (sucesso, erro no campo, seleção atual/filtro ativo distintos).

## 3. Hierarquia e ritmo
Um ponto focal por tela; níveis de título distinguíveis (tamanho/peso/cor, não só um); espaçamento segue a escala (4/8) e **agrupa por proximidade** (mais espaço entre
grupos que dentro deles); medida de texto 45–75 caracteres; alinhamentos consistentes; densidade compatível com o produto.

## 4. "Cara de template" (genérico)
Gradiente roxo→azul por padrão, cards idênticos em grade sem hierarquia, ícones-emoji como design, sombras iguais em tudo, texto de preenchimento, botões todos primários,
cantos sempre 16 px, hero com 3 colunas de "features". Marque o que parece **decisão** (tem razão no produto) versus **piloto automático**; proponha a troca por escolhas ligadas à marca/tokens.

## Formato do resultado (entra em `reviewPasses[]` do audit)
`{pass, findings: <n>, severity: 'alta|média|baixa|—', notes: 'resumo + 1–2 exemplos com arquivo:linha'}`.
