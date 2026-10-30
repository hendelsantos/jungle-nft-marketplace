# Auditoria Lighthouse — medianas

Executado em 2026-10-30 com `npm run audit` (Vite build + preview em `127.0.0.1:4173`, mocks do MSW ativos). Três medições por página e perfil; a tabela abaixo mostra a mediana. Os relatórios completos (HTML/JSON) ficam em `lighthouse-reports/`, fora do controle de versão.

| Página      | Perfil  | Performance | Acessibilidade | Best Practices | SEO | LCP (ms) | CLS    | TBT (ms) |
| ----------- | ------- | ----------- | -------------- | -------------- | --- | -------- | ------ | -------- |
| home        | mobile  | 91          | 100            | 100            | 100 | 2916     | 0      | 73       |
| home        | desktop | 100         | 100            | 100            | 100 | 663      | 0      | 1,5      |
| nft-detail  | mobile  | 89          | 100            | 100            | 100 | 3223     | 0,0037 | 71,5     |
| nft-detail  | desktop | 100         | 100            | 100            | 100 | 705      | 0,0090 | 0        |

## Observações

- CLS do detalhe caiu de ~0,39 para < 0,01 após o skeleton passar a espelhar o layout final (mesmas seções e proporções).
- LCP mobile (~2,9–3,2 s) é dominado pela inicialização do service worker do MSW (top-level await em `src/main.tsx`) mais a busca inicial na API simulada; é um custo inerente ao modo demonstração com mocks e não existe contra uma API real.
- Correções que levaram Best Practices e SEO a 100: `public/robots.txt` válido, `public/favicon.svg` com `<link rel="icon">` no `index.html` (eliminou o 404 de `favicon.ico` no console).
