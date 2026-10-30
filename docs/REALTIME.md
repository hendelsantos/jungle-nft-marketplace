# Eventos Socket.IO simulados

URL padrão: `ws://jungle.mock/realtime/`. O origin e o path são passados separadamente ao cliente para manter o namespace Socket.IO padrão. O transporte é forçado para WebSocket. O MSW intercepta a conexão e `@mswjs/socket.io-binding` trata o handshake e os frames Socket.IO.

## Ordem de bootstrap

`startMocking()` termina antes de `socket.io-client` ser importado dinamicamente. Essa ordem é obrigatória porque o cliente captura `globalThis.WebSocket` durante o import.

## Envelope

```ts
interface RealtimeEnvelope<T> {
  eventId: string
  resourceId: string
  version: number
  occurredAt: string
  sessionId?: string
  userId?: string
  data: T
}
```

- `nft.updated`: payload `Nft`; invalida catálogo, detalhe, carrinho e cotação.
- `order.updated`: payload `Order`; exige `userId` da sessão atual e nunca regride um estado terminal.

O cliente mantém até 300 IDs vistos e a maior versão por recurso (lógica isolada e testada em `src/realtime/event-gate.ts`). Duplicatas e versões antigas são descartadas. Em todo `connect`, inclusive reconexão, recursos ativos são reconciliados pela API REST. O estado da conexão é publicado em `document.documentElement.dataset.realtime` (`connected`/`disconnected`) para depuração e para os testes aguardarem o canal antes de disparar atualizações. Logout desmonta o provider e desconecta o socket.

## Limitações reais

A versão adotada do binding oficial suporta namespace padrão e eventos de texto. Acknowledgements, namespaces customizados e anexos binários não são usados. Testes Node/jsdom não são representativos para este transporte; os testes relevantes rodam em Chromium, onde o WebSocket global é interceptável.
