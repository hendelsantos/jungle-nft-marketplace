import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { FavoriteResponse } from '@/api/contracts'
import { favoritesApi } from '@/api/client/api'
import { queryKeys } from '@/api/query-keys'
import { useAuth } from '@/features/auth/auth-provider'

export function useFavorites() {
  const { session } = useAuth()
  return useQuery({ queryKey: queryKeys.favorites(session?.user.id ?? 'anonymous'), queryFn: ({ signal }) => favoritesApi.list(signal), enabled: Boolean(session) })
}

export function useToggleFavorite() {
  const { session } = useAuth()
  const client = useQueryClient()
  const key = queryKeys.favorites(session?.user.id ?? 'anonymous')
  return useMutation({
    mutationFn: ({ nftId, active }: { nftId: string; active: boolean }) => active ? favoritesApi.remove(nftId) : favoritesApi.add(nftId),
    onMutate: async ({ nftId, active }) => {
      await client.cancelQueries({ queryKey: key })
      const previous = client.getQueryData<FavoriteResponse>(key)
      client.setQueryData<FavoriteResponse>(key, { nftIds: active ? (previous?.nftIds ?? []).filter((id) => id !== nftId) : [...new Set([...(previous?.nftIds ?? []), nftId])] })
      return { previous }
    },
    onError: (_error, _variables, context) => { if (context?.previous) client.setQueryData(key, context.previous) },
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  })
}
