# Relatório final de cobertura

Data: 2026-10-31. Ambiente: Node 20.20, npm 10.8 (`--legacy-peer-deps`), Chromium via Playwright 1.63, build Vite 8.3.2 sobre `dist/` em `npm run preview`.

## Execuções verificadas

| Verificação | Comando | Resultado |
| ----------- | ------- | --------- |
| Typecheck estrito (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) | `npm run typecheck` | 0 erros |
| Lint (zero erros, zero avisos) | `npm run lint` | 0 problemas |
| Testes unitários | `npm run test:unit` | 12/12 (3 arquivos) |
| E2E (12 grupos × desktop 1440 + mobile 390) | `npm run test:e2e` | 26/26 |
| Lighthouse (3 medições por página/perfil, mediana) | `npm run audit` | ver `docs/LIGHTHOUSE.md` |

## Cobertura por camada

- **Domínio monetário** (`src/lib/money.test.ts`): precisão decimal sem binários; desconto, taxa e formatação determinísticos.
- **Porta de eventos realtime** (`src/realtime/event-gate.test.ts`): dedupe por `eventId`, descarte de versões antigas por recurso, independência entre recursos, evicção do registro limitado e `reset`.
- **Parser de busca** (`src/routes/home-search.test.ts`): URL vazia, omissão de defaults, normalização de decimais (string/número), rejeição de entradas malformadas e subconjunto válido em mistura com lixo.
- **E2E (12 grupos do desafio)**: busca/filtros/ordenação/paginação/histórico; detalhe/404; cadastro/login/expiração/logout; favorito otimista com rollback; carrinho persistente e merge; compra confirmada com recibo imutável; pagamento recusado preservando itens; timeout recuperado com idempotência; perfil/senha/carteiras; preço mudando via Socket.IO durante checkout; evento antigo não regride versão (com reconexão offline/online); teclado/foco/validação nativa; skeleton lento/falha/recuperação.
- **Auditoria**: Acessibilidade, Best Practices e SEO 100 nos quatro combinações página/perfil; performance 91 (home mobile), 100 (home desktop), 89 (detalhe mobile), 100 (detalhe desktop); CLS ≤ 0,009; TBT ≤ 73 ms.

## Lacunas declaradas

1. **Baselines visuais (R24)**: `tests/visual/pages.spec.ts` pronto, mas snapshots deliberadamente não criados. A visão geral do Figma orientou a revisão da Home em 2026-10-31; a inspeção frame a frame segue inacessível e é necessária antes de aprovar baselines de Home, detalhe, carrinho e checkout.
2. **Perfil 768 px (R21)**: E2E cobre 390 e 1440; 768 aparece nos breakpoints CSS e no snapshot pendente, sem asserção automatizada própria.
3. **LCP mobile (~2,9–3,2 s)**: dominado pelo startup do service worker do MSW e pela primeira busca simulada; custo do modo demonstração, não existiria contra API real.
4. **Testes de integração dedicados aos handlers (R13/R14)**: cobertos indiretamente por todos os fluxos E2E; não há suíte Vitest isolada por handler.
5. **Deploy (R26)**: concluído no Railway em 2026-10-31; deployment em `SUCCESS` e smoke público aprovado para Home, rota direta, service worker MSW e assets.

## Cobertura de código

`npm run test:unit` executa com configurador de cobertura (`vitest.config.ts`), mas nenhuma meta de cobertura foi estabelecida pelo desafio; os números de linhas não são rastreados neste relatório. A garantia de comportamento vem da matriz E2E acima.
