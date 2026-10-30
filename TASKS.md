# Tarefas e evidências

Atualizado em: 2026-10-30.

Legenda: `[x]` concluído e verificado; `[~]` implementado, ainda sem verificação completa; `[ ]` pendente; `[!]` bloqueado.

## Descoberta

- [x] Inspecionar diretório sem sobrescrever arquivos — estava vazio, sem Git válido.
- [x] Ler README oficial integralmente — requisitos 1–12 cobertos em `REQUIREMENTS.md`.
- [!] Inspecionar Figma — navegador e leitura pública indisponíveis nesta sessão.
- [x] Registrar matriz, riscos e decisões arquiteturais.

## Fundação

- [x] Criar Vite + React + TypeScript estrito — dependências instaladas com `npm install --legacy-peer-deps` (bug do Arborist do npm 10 com esta árvore de dependências).
- [x] Integrar TanStack Router e Query — verificado por typecheck; `@tanstack/react-query` atualizado para 5.105.0 (5.101.4 quebrava inferência de `TData` com TypeScript 6 via `NoInfer`).
- [x] Centralizar Axios e erros — contratos e cliente verificados por typecheck estrito com `exactOptionalPropertyTypes`.
- [x] Configurar Tailwind e UI shadcn-style — build Vite 8 aprovado.
- [x] Configurar MSW browser/node e reset — handlers REST/WebSocket e persistência verificados por E2E; inicialização garantida antes do `load` via top-level await.
- [x] Configurar Playwright, Vitest e Lighthouse — todos executados e aprovados (ver Qualidade).

## Produto

- [x] Layout base responsivo — E2E em 390/1440 px; baseline 768 px pendente com o Figma.
- [x] Home integrada à API simulada — E2E grupo 1.
- [x] Busca, coleção, disponibilidade, faixa decimal de preço, ordenação e paginação preservadas na URL; E2E aprovado (URLs sem defaults serializados e decimais sem aspas).
- [x] Detalhe e favoritos — E2E grupos 2 e 4.
- [x] Carrinho e cupom — E2E grupos 5 e 6.
- [x] Login e cadastro — E2E grupo 3.
- [x] Perfil e senha — E2E grupo 8.
- [x] Carteiras — E2E grupo 8.
- [x] Checkout idempotente — E2E grupos 6, 7, 7b e 9.
- [x] Pedido/recibo — E2E grupo 6 (recibo imutável) e 7.
- [x] Realtime Socket.IO — E2E grupos 9 e 10, incluindo reconexão offline/online.

## Qualidade

- [x] Unitários — 12 testes aprovados com Vitest 5: domínio monetário, porta de eventos realtime (dedupe/versões) e parser de busca da Home.
- [x] 12 grupos E2E aprovados em 2026-10-30 — 26 testes (chromium-desktop 1440px + chromium-mobile 390px) verdes via `npx playwright test tests/e2e`.
- [~] Baselines visuais — dependem de inspeção do Figma; fluxo de captura pronto (`npm run test:visual:update`).
- [x] Typecheck/lint/build — aprovados em 2026-10-30 com dependências instaladas (`tsc -b`, `eslint --max-warnings=0`, `vite build`).
- [x] Lighthouse 3x por página/perfil — executado em 2026-10-30; medianas em `docs/LIGHTHOUSE.md` (A11y/BP/SEO 100; performance 91/100/89/100; CLS ≤ 0,009).
- [x] Verificação sintática de todos os `.ts/.tsx` — `SYNTAX_CHECK_OK` com TypeScript 6.0.3 do cache local.
- [x] Relatório final de cobertura — `docs/COVERAGE.md` com execuções, cobertura por camada e lacunas declaradas.
- [x] Git inicializado por diretório de metadados isolado; primeiro commit e branch `main` publicados no GitHub.
- [!] Deploy — depende de autorização explícita do usuário.
