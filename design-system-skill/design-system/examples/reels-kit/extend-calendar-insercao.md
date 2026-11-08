## New Component: Calendar (inserção)

### Problem
Vídeos que citam datas, feriados ou fins de semana remunerados hoje exigem componente próprio (feito à mão em examples/financas); falta uma versão na biblioteca de dados.

### Existing Patterns
| Related Component | Similarity | Why It's Not Enough |
|---|---|---|
| RowsList | lista de itens com ícone | não mostra a grade de dias nem destaca datas |
| DotsGrid | grade de itens que mudam de grupo | sem rótulos de dia/semana |

### Proposed Design

#### API / Props
| Property | Type | Default | Description |
|---|---|---|---|
| month | {days: number; startsOn: 0-6} | 30 dias, quarta | Formato do mês exibido. |
| highlights | {days: number[]; tone: ColorName; label: string; at: number}[] | [] | Dias destacados e quando entram. |

#### Variants
| Variant | Use When | Visual |
|---|---|---|
| weekend | sábados e domingos | dias em verde |
| holiday | feriados | dias em dourado |

#### States
| State | Behavior | Notes |
|---|---|---|
| Entrada | dia a dia com escala 0,4→1 | ancorado em `at` |

#### Tokens Used
- Colors: C.card2, C.line, C.green, C.gold
- Spacing: —
- Typography: FONT.head

### Accessibility
- **Role**: Elemento visual de vídeo
- **Keyboard**: Não interativo
- **Screen reader**: A informação precisa estar na fala/legenda

### Open Questions
- Promover para library.tsx (≥ 2 usos) ou manter só como exemplo?
- Aceitar semana começando no domingo?
