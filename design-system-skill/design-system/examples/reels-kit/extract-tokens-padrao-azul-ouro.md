## Design Tokens Extraction

### Sources
- template/design-system/design-system.json
- template/src/brand.generated.ts

### Extracted
| Category | Count | Notes |
|---|---|---|
| Colors | 12 | 5 de superfície/linha, 2 de texto, 5 de papel (accent, positive, negative, info, extra) |
| Typography | 2 | Montserrat (head 600/800/900) e Inter (body 500/700); sem escala de tamanhos definida |

### Gaps (decisões do usuário — nada foi inventado)
- Escala de tamanhos de fonte não definida — decisão do usuário
- Níveis de sombra/elevação não definidos
- Escala de espaçamento não definida

### Inconsistencies (sinalizadas, não mescladas)
| Issue | Values | Where | Suggestion |
|---|---|---|---|
| Nomes de aparência no código × nomes de papel no JSON | gold, accent | brand.generated.ts × design-system.json | expor aliases semânticos (confirmar) |

### Output
Tokens escritos em `design-system/tokens.extracted.css (não gerado neste exemplo)`.

### Next Steps
1. Decidir as lacunas com o usuário
2. Rodar audit após criar as escalas
