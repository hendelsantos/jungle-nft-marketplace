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
- [x] Configurar Playwright, Vitest e Lighthouse — Playwright executado; Lighthouse pendente.

## Produto

- [~] Layout base responsivo.
- [~] Home integrada à API simulada.
- [x] Busca, coleção, disponibilidade, faixa decimal de preço, ordenação e paginação preservadas na URL; E2E aprovado (URLs sem defaults serializados e decimais sem aspas).
- [~] Detalhe e favoritos.
- [~] Carrinho e cupom.
- [~] Login e cadastro.
- [~] Perfil e senha.
- [~] Carteiras.
- [~] Checkout idempotente.
- [~] Pedido/recibo.
- [~] Realtime Socket.IO.

## Qualidade

- [x] Unitários do domínio monetário — 2 testes aprovados com Vitest 5 (`npm run test:unit`).
- [x] 12 grupos E2E aprovados em 2026-10-30 — 26 testes (chromium-desktop 1440px + chromium-mobile 390px) verdes via `npx playwright test tests/e2e`.
- [!] Baselines visuais — dependem de execução e inspeção do Figma.
- [x] Typecheck/lint/build — aprovados em 2026-10-30 com dependências instaladas (`tsc -b`, `eslint --max-warnings=0`, `vite build`).
- [!] Lighthouse 3x por página/perfil — ainda não executado.
- [x] Verificação sintática de todos os `.ts/.tsx` — `SYNTAX_CHECK_OK` com TypeScript 6.0.3 do cache local.
- [ ] Relatório final de cobertura.
- [x] Git inicializado por diretório de metadados isolado; primeiro commit e branch `main` publicados no GitHub.
- [!] Deploy — depende de autorização explícita do usuário.
