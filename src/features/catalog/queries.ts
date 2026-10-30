import { useQuery } from '@tanstack/react-query'
import type { NftSearchParams } from '@/api/contracts'
import { nftApi } from '@/api/client/api'
import { queryKeys } from '@/api/query-keys'

export function useNfts(params: NftSearchParams) {
  return useQuery({ queryKey: queryKeys.nfts.list(params), queryFn: ({ signal }) => nftApi.list(params, signal), placeholderData: (previous) => previous })
}

export function useNft(id: string) {
  return useQuery({ queryKey: queryKeys.nfts.detail(id), queryFn: ({ signal }) => nftApi.detail(id, signal), retry: false })
}
