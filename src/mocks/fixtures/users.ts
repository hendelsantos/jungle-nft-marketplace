import type { Profile, Wallet } from '@/api/contracts'

export interface MockUser {
  id: string
  email: string
  passwordHash: string
  profile: Profile
}

export const userFixtures: MockUser[] = [
  {
    id: 'user_ana',
    email: 'ana@jungle.demo',
    passwordHash: 'demo$e9982af3',
    profile: { userId: 'user_ana', name: 'Ana Explorer', email: 'ana@jungle.demo', bio: 'Colecionadora de criaturas digitais.', country: 'Brasil', avatarUrl: '/assets/avatar-ana.svg', version: 1 },
  },
  {
    id: 'user_caio',
    email: 'caio@jungle.demo',
    passwordHash: 'demo$eff690e7',
    profile: { userId: 'user_caio', name: 'Caio Collector', email: 'caio@jungle.demo', bio: 'Em busca de edições raras.', country: 'Portugal', avatarUrl: '/assets/avatar-caio.svg', version: 1 },
  },
]

export const walletFixtures: Wallet[] = [
  { id: 'wallet_ana_1', userId: 'user_ana', label: 'Carteira principal', address: '0x1234567890abcdef1234567890abcdef12345678', network: 'ethereum', primary: true, connected: false, version: 1 },
  { id: 'wallet_caio_1', userId: 'user_caio', label: 'Polygon Vault', address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', network: 'polygon', primary: true, connected: false, version: 1 },
]
