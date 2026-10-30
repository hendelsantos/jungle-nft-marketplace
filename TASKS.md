# Tarefas e evidências

Atualizado em: 2026-10-30.

Legenda: `[x]` concluído e verificado; `[~]` implementado, ainda sem verificação completa; `[ ]` pendente; `[!]` bloqueado.

## Descoberta

- [x] Inspecionar diretório sem sobrescrever arquivos — estava vazio, sem Git válido.
- [x] Ler README oficial integralmente — requisitos 1–12 cobertos em `REQUIREMENTS.md`.
- [!] Inspecionar Figma — navegador e leitura pública indisponíveis nesta sessão.
- [x] Registrar matriz, riscos e decisões arquiteturais.

## Fundação

- [~] Criar Vite + React + TypeScript estrito — scaffold e configs criados; instalação bloqueada.
- [~] Integrar TanStack Router e Query — rotas, providers, chaves e cache implementados; typecheck pendente.
- [~] Centralizar Axios e erros — contratos e cliente implementados; execução pendente.
- [~] Configurar Tailwind e UI shadcn-style — tema e componentes locais implementados; build pendente.
- [~] Configurar MSW browser/node e reset — handlers REST/WebSocket e persistência implementados; execução pendente.
- [~] Configurar Playwright, Vitest e Lighthouse — configs/scripts criados; dependências indisponíveis.
- [!] Instalar dependências — npm falha com `EAI_AGAIN`; offline para em `@mswjs/socket.io-binding` não armazenado no cache.

## Produto

- [~] Layout base responsivo.
- [~] Home integrada à API simulada.
- [~] Detalhe e favoritos.
- [~] Carrinho e cupom.
- [~] Login e cadastro.
- [~] Perfil e senha.
- [~] Carteiras.
- [~] Checkout idempotente.
- [~] Pedido/recibo.
- [~] Realtime Socket.IO.

## Qualidade

- [~] Unitários do domínio monetário escritos; o módulo real foi transpilado e executado com `decimal.js` 10.6.0 (`MONEY_DOMAIN_CHECK_OK`), mas o runner Vitest segue bloqueado.
- [~] 12 grupos E2E escritos; não executados.
- [!] Baselines visuais — dependem de execução e inspeção do Figma.
- [!] Typecheck/lint/build — dependências não puderam ser instaladas.
- [!] Lighthouse 3x por página/perfil — build/browser indisponíveis.
- [x] Verificação sintática de todos os `.ts/.tsx` — `SYNTAX_CHECK_OK` com TypeScript 6.0.3 do cache local.
- [ ] Relatório final de cobertura.
- [!] Commits — `.git/` vazio e somente leitura nesta sessão.
- [!] Deploy — depende de autorização explícita do usuário.
