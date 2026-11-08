# 03 · Design system do canal

Um único arquivo — `design-system/design-system.json` — define a identidade de **todos** os vídeos. `npm run design` o converte em
`src/brand.generated.ts` (cores `C`, fontes `FONT`, formas `SHAPE`, legenda `CAPTION`, fundo `BACKGROUND`, movimento `MOTION`,
ganho de SFX). Nenhum componente usa cor/fonte solta: tudo vem desses tokens. Trocar o JSON troca o canal inteiro.

## Fluxo para a IA
1. **Existe identidade?** Peça (ou procure na pasta do usuário) logo, paleta, fontes, vídeos anteriores. Se há logo/prints, extraia as cores
   dominantes (3 cores de marca) e a fonte (nome no site/Instagram).
2. **Não existe?** Entrevista curta (uma mensagem, 5 perguntas): nicho e público · tom (sério/analítico, enérgico, didático, luxo, tech) ·
   1–3 cores que já usa · fonte favorita (ou "escolha por mim") · nome/@ do canal.
3. **Proponha** copiando um exemplo de `design-system/exemplos/` e ajustando (veja "Como escolher" abaixo).
4. `npm run design` → `npm run ds:preview` → **mostre a prancha** (`work/stills/DesignSystem_0.png`) ao usuário. Itere até ele aprovar.
5. **Congele**: salve o JSON aprovado em `design-systems/<nome-do-canal>.json` (pasta fora do projeto de vídeo, ex.: ao lado do template)
   e copie-o para cada novo vídeo. Mudar o design system de um canal só por pedido expresso.

## Esquema (todas as chaves são obrigatórias)
```jsonc
{
  "name": "nome-do-canal",
  "brand": {"name": "Meu Canal", "handle": "@meucanal", "tagline": ""},
  "colors": {                         // sempre #rrggbb
    "ink":   "#06122b",               // fundo mais escuro (atrás de tudo)
    "navy":  "#0b1e3d",               // fundo do gradiente / fim do cartão
    "card":  "#10264c",               // começo do gradiente do cartão
    "card2": "#16315f",               // linhas e blocos dentro do cartão
    "line":  "#2b4a7d",               // bordas
    "text":  "#f4f7ff",               // texto principal
    "mute":  "#9fb3d6",               // texto secundário
    "accent":"#ffc83d",               // DESTAQUE da marca: palavra ativa, kickers, pílulas principais
    "positive":"#2ee59d",             // ✓, ganho, "mantido"
    "negative":"#ff5d6c",             // ✗, perda, alerta
    "info":  "#4da3ff",               // neutro/informação
    "extra": "#a99bff"                // 5ª cor de apoio
  },
  "gradient": ["accent", "positive"], // barra de progresso e fio do cartão (nomes de cores acima)
  "fonts": {                          // QUALQUER família do Google Fonts; weights como strings
    "head": {"family": "Montserrat", "weights": ["600","800","900"]},
    "body": {"family": "Inter",      "weights": ["500","700"]}
  },
  "shape": {"cardRadius": 48, "windowRadius": 44, "borderWidth": 3, "accentBar": true},
  "captions": {"highlight": "accent", "sizeFull": 64, "sizeSplit": 48, "plateColor": "ink", "uppercase": false},
  "background": {"style": "grid", "gridOpacity": 0.07},   // style: "grid" | "plain"
  "speaker": {"ring": "accent"},                           // anel em volta da janela do apresentador
  "motion": {"damping": 15, "stiffness": 150},             // mola das entradas: damping menor = mais "elástico"
  "sfx": {"gain": 1.25}                                    // multiplicador dos efeitos (0.8 mais discreto)
}
```

## Como escolher (regras que evitam retrabalho)
- **O kit é desenhado sobre fundo escuro.** Mantenha `ink/navy/card` escuros (luminância baixa) e `text` claro. Para marca clara, use
  fundo escuro com `accent` da marca; tema claro exigiria revisar sombras e `text` dentro de `library.tsx`.
- **Uma cor de destaque só** (`accent`): é a que o olho segue (palavra falada, kickers, pílula principal). `positive/negative` mantêm
  sentido universal (verde bom, vermelho ruim) — não troque por cores de marca se isso inverter o significado.
- **Contraste**: o gerador avisa se texto/fundo < 4,5:1. Texto pequeno em `mute` sobre `card` precisa passar. Corrija a cor, não ignore o aviso.
- **Fontes**: `head` = título forte (peso 800–900; Montserrat, Poppins, Archivo Black, Bebas Neue, Anton, Sora, Outfit…);
  `body` = legível em tamanho pequeno (Inter, DM Sans, Plus Jakarta Sans, Nunito Sans). Duas famílias no máximo. O gerador importa
  `@remotion/google-fonts/<NomeSemEspaços>` — se o nome não existir, o `npm run design`/render acusa; confira a grafia em fonts.google.com.
  Verifique que os pesos pedidos existem para a família.
- **Legenda**: `uppercase: true` combina com fontes condensadas (Bebas/Anton) e canais de impacto; mantenha ≤ 5 palavras por bloco.
- **Movimento**: `damping` 12–14 = mais bounce (energia); 18–22 = sóbrio (finanças, saúde, institucional).
- **Prancha primeiro**: nenhum gráfico novo antes de o usuário aprovar `ds:preview`.

## Vários canais / marcas
Mantenha uma pasta `design-systems/` (fora dos projetos de vídeo) com um JSON por canal. Para cada vídeo novo:
`copy design-systems/<canal>.json <projeto>/design-system/design-system.json && npm run design`.
Exemplos prontos em `template/design-system/exemplos/`: `azul-ouro` (finanças/análise), `grafite-laranja` (tech/produtividade),
`vinho-areia` (lifestyle/negócios premium), `verde-neon` (energia/fitness/cripto).

## O que NÃO muda com o design system
Geometria dos layouts (`layout.ts`), tempos de animação das trocas, estrutura dos componentes, regras de rosto/zona segura.
Se a marca exigir layout próprio (ex.: apresentador sempre à direita), crie um novo layout em `layout.ts` — veja o guia 04.
