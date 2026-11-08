# Modo EXTRACT — extrair tokens e inventário de uma fonte existente

Use quando **não existe design system formal** (ou ele está só implícito no código/site/brand guide). Entrega: (1) **arquivo de tokens** no formato da fonte e
(2) `extract-<nome>.html/.md` com fontes, categorias extraídas, **lacunas**, **inconsistências** e próximos passos.
Método inspirado no passe `design-system-extract` do repositório MIT [Trystan-SA/claude-design-system-prompt](https://github.com/Trystan-SA/claude-design-system-prompt) (redação própria).

## Regras de ouro
1. **Extraia valores reais, nunca estime.** Cor vem de hex no código/arquivo/pixel de print; fonte vem do CSS/`@font-face`/Google Fonts; escala de espaçamento vem do que **está em uso**.
2. **Lacuna é decisão do usuário.** Se a fonte não define (ex.: não há sombras, não há cores semânticas), registre em `gaps[]`; **não preencha** com valores "razoáveis".
3. **Inconsistência é informação.** Cores quase iguais, neutros de tons diferentes, espaçamentos fora da escala → `inconsistencies[]`; **não mescle** em silêncio (proponha, mas deixe o usuário decidir).
4. **Só o que é usado:** pesos de fonte realmente carregados, tamanhos realmente aplicados — não uma escala genérica.

## Passo a passo
1. **Fontes.** O que há para extrair: código (temas, CSS, tailwind), site no ar, prints, brand guide/PDF, arquivo de design. Não especificado? **Pergunte**.
2. **Varredura (código).** `node scripts/scan-tokens.mjs <pasta>`; `hardcoded.colors.top` etc. já dá os valores mais usados com arquivos. Para site/prints: leia CSS computado/DevTools ou amostre pixels (cite como "amostrado de print").
3. **Por categoria**, com contagem de uso quando possível:
   - **Cores:** marca (primária/acento + variações), semânticas (sucesso/aviso/erro/info + fundos claros), **neutros** (escala de 9–11 passos, mesmo tom), superfícies (fundo, texto, card, overlay, borda).
   - **Tipografia:** famílias + pilha de fallback, escala de tamanhos em uso, pesos carregados, entrelinhas (título, corpo, texto longo), tracking (sobretudo caixa alta), estilos nomeados.
   - **Espaçamento:** a escala em uso (e escalas distintas por relação, se existirem).
   - **Raios e sombras:** raios distintos; elevações completas (valor inteiro).
   - **Se existirem:** z-index, durações/easings, breakpoints, larguras de container.
4. **Emita o arquivo de tokens** no **formato da fonte** (CSS custom properties, TS, JSON, extensão do Tailwind). Fonte sem formato → pergunte; padrão seguro: **CSS custom properties** + espelho **DTCG JSON** (`tokens.md`). Agrupe por categoria
   (`color-brand-*`, `color-semantic-*`, `color-neutral-*`, `color-surface-*`, `font-*`, `space-*`, `radius-*`, `shadow-*`, `motion-*`). Nomes por **papel**, não por aparência (`color-accent`, não `color-yellow`), exceto a escala de neutros.
   **Não sobrescreva** arquivo de tokens existente: grave ao lado (`tokens.extracted.css`) e informe.
5. **Contraste:** calcule (ou meça) razões dos pares principais (texto/superfície, acento/superfície) e liste os que falham em AA.
6. **Inventário de componentes (opcional):** nomes, variantes, estados observados — o detalhe fica para o modo `document`.
7. **JSON → artefato:** esquema `extract` (inclui `palette[]` com hex para o HTML mostrar amostras) e `node scripts/render-artifact.mjs extract extracao.json`.

## Próximos passos típicos (entram em `nextSteps[]`)
Revisar o arquivo de tokens com o usuário → decidir lacunas e inconsistências → referenciar os tokens no código (substituir valores fixos) → rodar `audit` para medir a cobertura → `document` nos componentes principais.
