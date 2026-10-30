# Contratos REST

Base URL: `/api`. JSON em request/response. Recursos privados exigem `Authorization: Bearer <session-id>`. ETH é sempre string decimal. Erros seguem `{ "error": { "code", "message", "fieldErrors?", "retryable?" } }`.

| Método | Caminho | Auth | Entrada | Saída / erros principais |
|---|---|---:|---|---|
| POST | `/auth/register` | não | `RegisterInput` | `201 AuthResponse`; 400, 409 |
| POST | `/auth/login` | não | `LoginInput` | `AuthResponse`; 401 |
| GET | `/auth/session` | sim | — | `Session`; 401 |
| POST | `/auth/logout` | sim | — | `{ok:true}` |
| GET | `/nfts` | não | query `NftSearchParams` | `NftListResponse`; 500/network |
| GET | `/nfts/:id` | não | — | `Nft`; 404 |
| GET | `/favorites` | sim | — | `FavoriteResponse` |
| POST | `/favorites` | sim | `{nftId}` | `FavoriteResponse`; 404/500 |
| DELETE | `/favorites/:nftId` | sim | — | `FavoriteResponse` |
| GET | `/cart` | opcional | header anônimo automático | `Cart` |
| POST | `/cart/items` | opcional | `AddCartItemInput` | `201 Cart`; 404/409 |
| PATCH | `/cart/items/:id` | opcional | `{quantity}` | `Cart`; 400/404/409 |
| DELETE | `/cart/items/:id` | opcional | — | `Cart`; 404 |
| PATCH | `/cart/coupon` | opcional | `{code: string|null}` | `Cart`; 404/409 |
| POST | `/quotes` | sim | — | `201 Quote`; 409 stale/empty |
| POST | `/orders` | sim | `CreateOrderInput`; header `Idempotency-Key` | `201 Order`; 400/409/timeout |
| GET | `/orders/:id` | sim | — | `Order`; 403/404 |
| GET/PATCH | `/profile` | sim | `UpdateProfileInput` no PATCH | `Profile`; 400 |
| PATCH | `/profile/password` | sim | `ChangePasswordInput` | `{ok:true}`; 400 |
| GET/POST | `/wallets` | sim | `WalletInput` no POST | `Wallet[]` / `201 Wallet` |
| PATCH/DELETE | `/wallets/:id` | sim | edição parcial | `Wallet` / `{ok:true}`; 400/403/404 |

Os tipos completos estão em `src/api/contracts`. Endpoints `POST /api/__mock/reset` e `POST /api/__mock/nfts/:id/update` são controles exclusivos da simulação/testes.

## Idempotência

O mock canoniza o payload relevante e persiste a relação `(userId, key, payload, orderId)` antes de simular timeout. Mesma chave e payload retorna o pedido original; mesma chave com payload diferente retorna `409 IDEMPOTENCY_CONFLICT`.
