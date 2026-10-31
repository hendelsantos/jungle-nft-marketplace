# Tarefas e evidências

Atualizado em: 2026-10-31.

Legenda: `[x]` concluído e verificado; `[~]` implementado, ainda sem verificação completa; `[ ]` pendente; `[!]` bloqueado.

## Descoberta

- [x] Inspecionar diretório sem sobrescrever arquivos — estava vazio, sem Git válido.
- [x] Ler README oficial integralmente — requisitos 1–12 cobertos em `REQUIREMENTS.md`.
- [~] Inspecionar Figma — README oficial e miniatura pública do arquivo `Ff0SksUi7UFtPWUO8kyNtw` recuperados; visão geral comparada. A inspeção interativa por frame segue bloqueada pelo host/CloudFront.
- [x] Registrar matriz, riscos e decisões arquiteturais.

## Fundação

- [x] Criar Vite + React + TypeScript estrito — dependências instaladas com `npm install --legacy-peer-deps` (bug do Arborist do npm 10 com esta árvore de dependências).
- [x] Integrar TanStack Router e Query — verificado por typecheck; `@tanstack/react-query` atualizado para 5.105.0 (5.101.4 quebrava inferência de `TData` com TypeScript 6 via `NoInfer`).
- [x] Centralizar Axios e erros — contratos e cliente verificados por typecheck estrito com `exactOptionalPropertyTypes`.
- [x] Configurar Tailwind e UI shadcn-style — build Vite 8 aprovado.
- [x] Configurar MSW browser/node e reset — handlers REST/WebSocket e persistência verificados por E2E; inicialização garantida antes do `load` via top-level await.
- [x] Configurar Playwright, Vitest e Lighthouse — todos executados e aprovados (ver Qualidade).

## Produto

- [x] Layout base responsivo — E2E em 390/1440 px; Home revisada em 2026-10-31 para a identidade marrom/laranja observada na visão geral oficial, com retratos originais otimizados; baseline 768 px pendente.
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
- [x] 12 grupos E2E aprovados novamente em 2026-10-31 — 26 testes (chromium-desktop 1440px + chromium-mobile 390px) verdes via `npx playwright test tests/e2e`.
- [~] Baselines visuais — Home comparada à visão geral pública e validada manualmente em 390/1440 px; frames detalhados de Home, detalhe, carrinho e checkout ainda dependem do acesso interativo. Fluxo de captura pronto (`npm run test:visual:update`).
- [x] Revisão visual da Home em 2026-10-31 — typecheck, lint, 12 unitários, build e E2E grupo 1 (desktop+mobile) aprovados; quatro WebP originais entre 77–91 KB.
- [x] Typecheck/lint/build — aprovados novamente em 2026-10-31 com dependências instaladas (`tsc -b`, `eslint --max-warnings=0`, `vite build`).
- [x] Lighthouse 3x por página/perfil — executado em 2026-10-30; medianas em `docs/LIGHTHOUSE.md` (A11y/BP/SEO 100; performance 91/100/89/100; CLS ≤ 0,009).
- [x] Verificação sintática de todos os `.ts/.tsx` — `SYNTAX_CHECK_OK` com TypeScript 6.0.3 do cache local.
- [x] Relatório final de cobertura — `docs/COVERAGE.md` com execuções, cobertura por camada e lacunas declaradas.
- [x] Git inicializado por diretório de metadados isolado; primeiro commit e branch `main` publicados no GitHub.
- [x] Deploy Railway autorizado e concluído em 2026-10-31 — deployment `8c7aeef9-7b96-417b-9d9d-7c0a8df64fcb` em `SUCCESS`; Home, rotas diretas, MSW e assets validados na URL pública.
