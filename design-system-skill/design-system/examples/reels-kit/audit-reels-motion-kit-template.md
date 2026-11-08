## Design System Audit

### Summary
**Components reviewed:** 12 | **Issues found:** 14 | **Score:** 69/100

### Naming Consistency
| Issue | Components | Recommendation |
|---|---|---|
| Tokens de cor com nome de APARÊNCIA, enquanto o design-system.json usa nome de PAPEL (accent, positive, negative, info, extra) | brand.generated.ts → C.gold/green/red/blue/violet, design-system.json → accent/positive/negative/info/extra | Expor aliases semânticos em C (C.accent, C.positive…) e migrar os usos; manter os nomes antigos como depreciados por uma versão. |
| Chaves de tema em estilos misturados (palavra única, CONSTANT, camelCase) | C.ink/navy…, SFX_GAIN, GRADIENT, CAPTION.sizeFull | Padronizar: objetos em camelCase/palavra única (C, FONT, SHAPE, CAPTION, MOTION) e constantes soltas dentro de um objeto (SFX_GAIN → AUDIO.sfxGain). |
| Arquivos de componente em estilos diferentes e vários componentes por arquivo | ui.tsx (25 componentes), inserts/library.tsx (12), Captions.tsx / Speaker.tsx (PascalCase) | Um estilo só (PascalCase por componente) ou documentar a convenção 'um arquivo por família' (ui.tsx = primitivos, library.tsx = inserções). |

### Token Coverage
| Category | Defined | Hardcoded Values Found |
|---|---|---|
| Colors | 12 (C) + gradiente + legenda | 22 usos / 12 distintos (#fff ×10, rgba(0,0,0,.5) sombras/scrims) — Fixos concentrados em branco sobre cor cheia e sombras; falta token 'onAccent' e 'scrim'. |
| Typography | 2 famílias (head/body) | 26 usos de tamanho / 19 distintos — Não há escala de tamanhos; cada componente escolhe o seu (ex.: 90, 40, 30, 20 px). |
| Spacing | 0 | 37 usos fora da escala de 4 px (18, 14, 30, 26 px…) — Em vídeo 1080 px pode ser aceitável, mas então documente a escala em vez de deixar implícita. |
| Radius | 2 (cardRadius, windowRadius) | 38 usos / 19 distintos (24, 30, 28, 20, 36 px) — Faltam raios nomeados (sm/md/lg/pill). |
| Shadows | 0 | 4 sombras literais — Sem níveis de elevação. |
| Motion | MOTION.damping/stiffness | springs fixos em vários componentes — Tokens existem, mas os componentes passam configs próprias. |

### Component Completeness
| Component | States | Variants | Docs | Score |
|---|---|---|---|---|
| TitleCard | ✅ | ⚠️ | ⚠️ | 7/10 |
| RowsList | ✅ | ✅ | ⚠️ | 8/10 |
| BigStat | ✅ | ⚠️ | ⚠️ | 7/10 |
| Bars | ✅ | ✅ | ⚠️ | 8/10 |
| LineChart | ✅ | ⚠️ | ⚠️ | 7/10 |
| PhotoCard | ✅ | ⚠️ | ⚠️ | 6/10 |
| Balance | ✅ | ⚠️ | ⚠️ | 7/10 |
| Captions | ✅ | ⚠️ | ✅ | 8/10 |

### Priority Actions
1. Expor aliases semânticos (C.accent, C.positive, C.negative, C.info, C.extra) em apply-design-system.mjs e migrar library.tsx/Main.tsx/Captions.tsx — hoje o nome diz a cor, não o papel.
2. Criar escalas nomeadas de fonte e de raio no design-system.json (hoje 19 tamanhos e 19 raios distintos) e gerá-las em brand.generated.ts.
3. Tokenizar os valores fixos repetidos: '#fff' ×10 → C.onAccent; rgba(0,0,0,.5) → SHADOW.card / SCRIM; sombras literais → níveis de elevação.
4. PhotoCard: <Img> sem alt (acessibilidade do artefato HTML/preview) e sem texto alternativo configurável; adicionar prop alt e documentar.
5. Documentar as props das 12 inserções (JSDoc + exemplo de timeline) — rodar o modo document nas 5 mais usadas: RowsList, BigStat, Bars, PhotoCard, Equation.

### Review Passes
| Pass | Findings | Severity | Notes |
|---|---|---|---|
| Acessibilidade | 2 | média | PhotoCard sem alt. Contrastes dos tokens padrão OK (texto/card 13,96:1; mute/card 7,05:1; negative/card 5,01:1); bordas decorativas line/card 1,69:1 não carregam informação. Não renderizado em navegador nesta auditoria. |
| Estados de interação | 0 | — | Não aplicável: componentes são quadros de vídeo, sem interação (hover/focus/loading). |
| Hierarquia e ritmo | 3 | baixa | Tamanhos de título variam entre 58 e 90 px sem escala; espaçamentos 14/18/26/30 px sem lógica de agrupamento clara. |

### Notes
Subtotais (rubrica de scoring.md): tokens 27/35 (cobertura heurística 76%, não amostrada integralmente) · nomenclatura 9/15 · componentes 26/35 (média 7,3/10 sobre 8 de 12 componentes amostrados; estados e acessibilidade tratados como não aplicáveis a vídeo) · documentação 7/15 (guia existe; sem changelog; ~40% documentado). A varredura incluiu src/examples/financas (referência), o que eleva contagens de valores fixos.
