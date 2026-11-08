# Pontuação do audit (0–100) e nota por componente (0–10)

A nota existe para **comunicar prioridade**, não para premiar. Mostre sempre os subtotais.

## Total = Tokens (35) + Nomenclatura (15) + Componentes (35) + Documentação e governança (15)

### Tokens (35)
- `coveragePercent` do scan (referências a tokens ÷ (referências + valores fixos)), **ajustado após a amostra**: `35 × cobertura/100`.
- Penalidade até −5: cores fixas distintas > 2× cores definidas, ou famílias de fonte fixas > 2.
- Sem nenhum token definido → 0 neste bloco.

### Nomenclatura (15)
- Um único estilo de nome de token (kebab **ou** camel) → +5; prefixos coerentes por categoria → +5; arquivos de componente num só estilo → +5.
- Cada inconsistência relevante tira 2–3 pontos (sempre listada em `naming[]`).

### Componentes (35) = média das notas /10 × 3,5
Nota de cada componente /10:
| Critério | Pontos | Como medir |
|---|---|---|
| Estados | 3 | default + hover + focus + disabled (+ loading/error se aplicável): 3 completos · 2 parciais · 1 só default · 0 |
| Variantes e tamanhos | 2 | variantes necessárias existem e se distinguem; tamanhos quando faz sentido |
| Documentação | 2 | story/MD/JSDoc com uso e props · 2 completo · 1 parcial |
| Acessibilidade | 2 | elemento nativo correto, nome acessível, teclado, foco visível, ARIA só se preciso |
| Tokens | 1 | usa tokens; 0 se tem cores/medidas fixas |
Componente "não aplicável" a um critério (ex.: um `Card` não tem `loading`) não perde ponto por isso.

### Documentação e governança (15)
- Existe guia de uso/README do sistema (+4) · changelog ou política de versão/migração (+4) · % de componentes documentados (+7 × fração).

## Faixas e linguagem
80–100 sólido · 55–79 funcional com dívida · < 55 frágil (priorize extração de tokens e padronização). Nunca apresente a nota como medida científica:
diga "heurística" e quanto da base foi amostrada.
