# Modo EXTEND — projetar um componente ou padrão novo

Entrega: `extend-<nome>.html/.md` — uma **proposta** (Problem, Existing Patterns, Proposed Design, Accessibility, Open Questions). **Não implemente** a menos que
o usuário peça depois; a proposta existe para decisão de design.

## Passo a passo
1. **Problema.** Qual necessidade do usuário/produto não está atendida? Quem sofre, em que tela, com que workaround hoje? Uma frase verificável, não "faltou um X".
2. **Padrões existentes.** Varra o sistema (`scan.components`, busca por nomes parecidos, stories). Liste os relacionados: o que compartilham e **por que não bastam**.
3. **Portão: estender o existente ou criar novo?** Prefira, nesta ordem: (a) **nova variante/tamanho** de um componente existente; (b) **composição** de componentes existentes;
   (c) componente novo — só se o padrão aparece em ≥ 2 lugares (ou é inevitável), tem API própria e não cabe em (a)/(b). Registre a decisão e o porquê.
4. **API.** Props com nome/tipo/padrão/descrição, **consistentes com as props existentes** (se o sistema usa `variant` e `size`, use os mesmos nomes e valores).
   Composição > configuração (`children`/slots antes de 12 props booleanas). Controlado × não controlado quando houver estado. Padrões sensatos: o uso comum não precisa de prop.
5. **Variantes e estados.** Para cada variante: quando usar e visual. Estados: default, hover, active, focus, disabled, loading, error (aplicáveis) com comportamento e notas (animação, tokens).
6. **Tokens.** Use **apenas tokens existentes**; liste os usados por categoria. Precisa de token novo? Proponha em "Open Questions" (nome sugerido + valor + justificativa) — não crie em silêncio.
7. **Acessibilidade.** Padrão WAI-ARIA correspondente (ex.: "Combobox", "Dialog (modal)", "Tabs"), role/elemento nativo, teclado completo, anúncio no leitor de tela, foco (onde entra/sai), movimento reduzido. Alvo de toque ≥ 44 px.
8. **Perguntas em aberto.** Decisões de revisão de design, casos-limite (texto longo, vazio, RTL, mobile, erro de rede), dependências, impacto em componentes existentes, plano de migração se algo quebra.
9. **JSON → artefato:** esquema `extend` em `references/artifacts.md`; `node scripts/render-artifact.mjs extend proposta.json`.

## Se o usuário pedir a implementação depois
Implemente no framework do projeto, com os tokens existentes, cobrindo todos os estados da proposta, com teste/story se o repo tem; rode lint/typecheck do projeto;
rode o modo `document` no componente criado. Uma mudança por vez; sem refatorar vizinhos.
