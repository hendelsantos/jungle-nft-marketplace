import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '@/api/client/api'
import type { AddCartItemInput } from '@/api/contracts'
import { queryKeys } from '@/api/query-keys'
import { useAuth } from '@/features/auth/auth-provider'

export function useCart() {
  const { session } = useAuth()
  const identity = session?.user.id ?? localStorage.getItem('jungle:anonymous-cart-id') ?? 'guest'
  return useQuery({ queryKey: queryKeys.cart(identity), queryFn: ({ signal }) => cartApi.get(signal), staleTime: 5_000 })
}

export function useCartActions() {
  const { session } = useAuth()
  const identity = session?.user.id ?? localStorage.getItem('jungle:anonymous-cart-id') ?? 'guest'
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: queryKeys.cart(identity) })
  return {
    add: useMutation({ mutationFn: (input: AddCartItemInput) => cartApi.add(input), onSuccess: refresh }),
    update: useMutation({ mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => cartApi.update(itemId, { quantity }), onSuccess: refresh }),
    remove: useMutation({ mutationFn: (itemId: string) => cartApi.remove(itemId), onSuccess: refresh }),
    coupon: useMutation({ mutationFn: (code: string | null) => cartApi.coupon({ code }), onSuccess: refresh }),
  }
}
