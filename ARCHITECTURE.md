# Arquitetura

## Visão geral

A aplicação é uma SPA React feature-first. A interface nunca consulta fixtures diretamente: os dados passam por Axios e pelos handlers MSW. Atualizações em tempo real chegam pelo `socket.io-client`, interceptado pelo MSW com `@mswjs/socket.io-binding`.

```text
React routes/components
  -> feature hooks
    -> TanStack Query
      -> typed API functions
        -> Axios
          -> MSW REST handlers

MSW WebSocket handler
  <-> Socket.IO protocol binding
    <-> socket.io-client
      -> realtime reconciler
        -> Query cache + REST invalidation
```

## Módulos

- `src/app`: providers, router e layouts.
- `src/routes`: composição das nove telas; regras de negócio ficam nas features.
- `src/features`: hooks, componentes e domínio por capacidade.
- `src/api/contracts`: tipos serializáveis dos contratos REST.
- `src/api/client`: instância Axios, normalização de erros e funções de endpoint.
- `src/mocks`: fixtures, banco persistente, cenários, handlers REST e realtime.
- `src/realtime`: lifecycle do socket, dedupe e reconciliação.
- `src/components/ui`: componentes locais no padrão shadcn/ui, com Radix quando necessário.
- `tests`: E2E, regressão visual e fixtures determinísticas.

## Decisões

### Estado remoto e local

TanStack Query mantém todo estado originado da API. A chave raiz de recursos privados inclui `session.user.id`; ao logout ou troca de usuário, queries privadas são removidas antes de ativar a nova identidade. Estado puramente efêmero (drawer, campo ainda não submetido e conexão visual da carteira) permanece local.

Política inicial: `staleTime` de 30 s para catálogo/detalhe, 5 s para carrinho/cotação/pedido e 60 s para perfil/carteiras. `gcTime` de 10 min. GETs idempotentes usam no máximo duas tentativas com backoff curto; 4xx e mutations não repetem automaticamente. Eventos atualizam versões conhecidas e invalidam a consulta para reconciliação.

### URL

Busca, coleções, faixa, disponibilidade, ordenação e página são search params validados da rota Home. Alterar busca/filtro/ordem reinicia `page=1`. O Router é responsável por proteção e pelo `redirect` de retorno.

### Persistência do mock

Um banco serializável em `localStorage` contém catálogo global e recursos indexados por usuário. Senhas fictícias são armazenadas como hashes determinísticos, nunca em texto puro. O carrinho visitante usa um ID anônimo; no primeiro login ele é mesclado transacionalmente, limitado pelo estoque.

### Dinheiro

Contratos usam strings decimais. `decimal.js` calcula subtotal, desconto, taxa e total e serializa ao final. A UI nunca usa `number`/float para ETH. O pedido guarda o snapshot completo da cotação.

### Idempotência

`POST /orders` exige `Idempotency-Key`. O mock armazena `{key, userId, canonicalPayload, orderId}`. Repetição equivalente recupera o pedido; payload diferente retorna 409. O pedido é criado antes do cenário de timeout, permitindo recuperação segura.

### Realtime MSW + Socket.IO

O worker MSW precisa iniciar antes de importar `socket.io-client`, porque o cliente captura a implementação global de WebSocket no import. Por isso o bootstrap do socket é dinâmico. O binding oficial traduz os frames Engine.IO/Socket.IO para eventos de texto.

Limitações documentadas do binding: namespace padrão e eventos de texto; sem acknowledgements nem anexos binários. O projeto não depende desses recursos. Cada payload contém `eventId`, `resourceId`, `version`, `occurredAt` e, para pedidos, `sessionId/userId`. O reconciliador mantém LRU de IDs e maior versão por recurso, ignora duplicatas/antigos e faz refetch REST em `connect` após reconexão.

### Segurança do desafio

Autenticação, carteiras e transações são inteiramente simuladas. Não há chave real, seed phrase, integração blockchain ou gateway. Handlers validam ownership. Erros são normalizados sem expor internals. Rotas privadas exigem sessão; logout desconecta socket e limpa cache privado.

### Acessibilidade

HTML semântico, skip link, foco visível, labels/descrições, `aria-live` para mutations/realtime e foco gerenciado em diálogos. Skeletons são ocultos de tecnologia assistiva e preservam dimensões. Animações respeitam `prefers-reduced-motion`.

## Sistema visual e Figma

A visão geral pública do Figma oficial foi recuperada em 2026-10-31 e usada para corrigir a direção visual da Home: fundo preto amarronzado, superfícies espresso, acento laranja queimado, tipografia sans local/system, hero dividido e retratos de macacos em enquadramento consistente. Os quatro retratos WebP são assets originais gerados para esta entrega e otimizados para 77–91 KB; não são exportações do Figma nem arquivos de soluções de terceiros.

O host de automação e o CloudFront ainda impedem abrir e inspecionar cada frame do arquivo. Por isso, medidas finas, fontes e baselines das quatro telas visuais continuam pendentes; a implementação não declara fidelidade pixel-perfect enquanto essa comparação detalhada não ocorrer.

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| import do Socket.IO antes do worker | import dinâmico após `worker.start()`; E2E de conexão |
| evento atrasado regredir cache | versão monotônica por recurso e status terminal de pedido |
| resposta HTTP fora de ordem | `AbortSignal` do Query para Axios e query keys completas |
| refresh durante pending/timeout | ordem persistida e busca por idempotency key/ID |
| merge visitante/autenticado duplicar | operação idempotente no mock por anonymous cart ID |
| float alterar ETH | `decimal.js` e strings nos limites |
| dados de usuário anterior | ownership no handler, chaves por usuário e limpeza no logout |
| divergência fina em relação ao Figma | direção visual alinhada à visão geral; não alegar fidelidade pixel-perfect até inspecionar frames e aprovar baselines |

## Deploy

O build é estático e requer fallback de SPA para `index.html`. `VITE_ENABLE_MOCKS=true` ativa MSW no build de demonstração. Nenhum serviço privado é necessário. O deploy autorizado usa Railway Railpack/Caddy e foi validado com acesso direto às rotas da SPA.
