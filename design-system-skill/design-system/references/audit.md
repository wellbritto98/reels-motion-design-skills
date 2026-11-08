# Modo AUDIT — auditoria do design system

Pergunta que o audit responde: **onde estamos, o que está inconsistente e o que corrigir primeiro.** Entrega: `audit-<projeto>.html/.md`.

## Passo a passo
1. **Escopo.** Repo todo ou pasta? Há design system formal (pasta `tokens/`, `theme`, Storybook, `tailwind.config`, `design-system.json`)? Pergunte se não achar.
2. **Varredura.** `node scripts/scan-tokens.mjs <pasta> --out design-system/artifacts/scan.json`. Leia o resumo; abra `scan.json` e olhe `hardcoded.*.top`, `naming`, `components`.
3. **Leia os arquivos de tokens** (`tokensDefined.*`): conte por categoria o que está **definido** (cores, tipografia, espaçamento, raio, sombra, movimento). A varredura só dá o total de custom properties; a divisão por categoria é leitura sua.
4. **Confira uma amostra** dos achados (pelo menos 5 por categoria com ocorrências): o valor fixo é realmente um token faltando, ou é exceção legítima (SVG, imagem, valor único de ilustração)? Ajuste os números em texto ("≈", "dos quais N são exceções").
5. **Tokens — tabela de cobertura.** Para cada categoria: `defined`, `hardcoded` (usos fixos), `coverage` (%) quando fizer sentido, `note` (ex.: "37 hex distintos; 12 são quase iguais a `--accent`").
   Mapeie: Colors ← `hardcoded.colors` · Typography ← `fonts` + `fontSizes` · Spacing ← `offScaleSpacing` (valores fora da escala de 4 px) · Radius ← `radii` · Shadows ← `shadows` · Motion ← `durations` · Z-index ← `zIndex` · Tailwind ← `tailwindArbitrary`.
6. **Nomenclatura.** Use `naming.tokenNameStyles` (kebab/camel/snake misturados?), `tokenPrefixes` (prefixos inconsistentes: `--color-*` e `--clr-*`?), `componentFileStyles` (Pascal × kebab). Cada problema vira linha `{issue, components[], recommendation}` com **um padrão a adotar**.
7. **Completude dos componentes.** (Cuidado: `states`, `a11y` e `hardcodedColors` do scan são do **arquivo**; se `componentsInFile > 1`, não atribua ao componente sem abrir o código. Constantes em CAIXA ALTA exportadas, como `ICONS`/`INSERTS`, podem aparecer como "componentes": descarte.) Para cada componente de `scan.components` (limite: os 15 mais usados/importantes; diga se amostrou), abra o arquivo e confirme **estados** (hover, focus, active, disabled, loading, error — só os aplicáveis), **variantes/tamanhos**, **docs**, **acessibilidade** (nativo > ARIA, teclado, foco visível) e **tokens**. Nota 0–10 (veja `scoring.md`). `states/variants/docs` ∈ `ok | warn | missing`.
8. **Passes de revisão (opcional, recomendado em UI nova):** `review-passes.md` — acessibilidade, estados de interação, hierarquia/ritmo, "cara de template". Resuma em `reviewPasses[]`.
9. **Pontuação.** `scoring.md`. Mostre os 4 subtotais em `notes` para o número ser auditável.
10. **Ações prioritárias (≤ 5).** Ordene por impacto × esforço; cada uma diz **onde**, **o quê** e **resultado esperado**:
    "Criar tokens de cor para os 14 hex mais repetidos (`#ffc83d` ×42 em 9 arquivos) → `--color-accent`…". Nada vago ("melhorar consistência").
11. **JSON → artefato:** `references/artifacts.md` (esquema `audit`) e `node scripts/render-artifact.mjs audit audit.json`.

## O que NÃO fazer
- Não "corrigir" o projeto durante o audit (é relatório). Correções só se o usuário pedir depois, uma ação por vez.
- Não contar como valor fixo o que está dentro de arquivos de tokens (o scan já os exclui), nem exceções óbvias.
- Não inflar nem esconder: se a varredura não achou design system, **diga** ("não há tokens definidos; cobertura 0%") e proponha o modo `extract`.
- Não citar número que você não conferiu. Sem amostra → "não verificado".

## Resposta final no chat (curta)
Pontuação e 3 maiores achados · caminho do `.html` e `.md` · o que não foi verificado · pergunta única do próximo passo (ex.: "extraio os tokens?").
