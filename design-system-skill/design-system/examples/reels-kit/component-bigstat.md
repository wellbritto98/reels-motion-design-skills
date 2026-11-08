## Component: BigStat

### Description
Número em destaque que sobe de 0 até o valor, para um dado isolado dito pelo apresentador (ex.: salário mínimo). Use uma vez por ideia; para comparar dois valores prefira Bars.

### Variants
| Variant | Use When |
|---|---|
| color: green \| gold \| red \| blue \| violet | green = positivo/ganho, red = perda/alerta, gold = destaque neutro |
| format: brl \| brl2 \| int \| dec1 \| dec2 \| pct | brl para reais inteiros, brl2 para centavos, pct para percentuais |

### Props / Properties
| Property | Type | Default | Description |
|---|---|---|---|
| value | number | — | Valor final da contagem. |
| at | number | — | Segundo ABSOLUTO do vídeo em que o número entra (use wordTime()). |
| format | 'brl'\|'brl2'\|'int'\|'dec1'\|'dec2'\|'pct' | 'int' | Formatação pt-BR do número. |
| color | ColorName | 'green' | Cor do número (token do design system). |
| kicker / label / sub | string | — | Textos opcionais acima e abaixo do número. |
| icon | string | — | Nome do ícone (clock, coin, trend…). |

### States
| State | Visual | Behavior |
|---|---|---|
| Entrada | Pop com escala 0,6→1 e fade | inicia em `at`; contagem de 36 quadros com easing out |
| Repouso | Número final na cor escolhida | permanece até o fim da página do grupo |
| Saída | Fade de 8 quadros | aplicada pelo ItemWrap quando não é a última página |

### Accessibility
- **Role**: Elemento visual de vídeo (sem role)
- **Keyboard**: Não interativo
- **Screen reader**: Informação equivalente deve estar na legenda/fala; o número não é lido isoladamente

### Do's and Don'ts
| ✅ Do | ❌ Don't |
|---|---|
| Ancorar `at` no onset da palavra do número | Mostrar um número que o apresentador não disse |
| Usar brl2 quando a fala cita centavos | Usar duas BigStat seguidas sem 1,5 s entre elas |

### Code Example
```ts
item(256.2, 271.2, 'BigStat', {label: 'Salário mínimo em 2026', value: 1621, format: 'brl', color: 'green', at: 260.5}, [[260.5, 'coin']])
```
