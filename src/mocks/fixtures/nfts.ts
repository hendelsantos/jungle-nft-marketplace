import type { Nft } from '@/api/contracts'
import Decimal from 'decimal.js'

const specs = [
  ['jungle-ape', 'Jungle Ape Genesis', 'Genesis', 'Maya Ito', '#dc8248', '0.84'],
  ['neon-tiger', 'Neon Tiger #08', 'Wild Circuit', 'Koa Studio', '#d6a65a', '1.25'],
  ['cyber-frog', 'Cyber Frog Prime', 'Metamorphs', 'Nori Labs', '#797b51', '0.42'],
  ['obsidian-owl', 'Obsidian Owl', 'Night Keepers', 'Ari Vale', '#835a55', '2.1'],
  ['solar-serpent', 'Solar Serpent', 'Wild Circuit', 'Koa Studio', '#b9653f', '0.68'],
  ['pixel-panther', 'Pixel Panther', 'Genesis', 'Maya Ito', '#c99851', '0.93'],
  ['void-gecko', 'Void Gecko', 'Metamorphs', 'Nori Labs', '#776052', '0.31'],
  ['forest-mech', 'Forest Mech', 'Mecha Flora', 'Feral Works', '#657153', '1.72'],
  ['magma-moth', 'Magma Moth', 'Night Keepers', 'Ari Vale', '#ad5d45', '0.56'],
  ['lotus-bot', 'Lotus Bot', 'Mecha Flora', 'Feral Works', '#8c7454', '1.08'],
  ['prism-parrot', 'Prism Parrot', 'Genesis', 'Maya Ito', '#9e755c', '0.77'],
  ['ancient-ibis', 'Ancient Ibis', 'Night Keepers', 'Ari Vale', '#72564c', '1.44'],
] as const

export const nftFixtures: Nft[] = specs.map(([slug, name, collection, creator, accent, price], index) => ({
  id: `nft_${index + 1}`,
  slug,
  name,
  description: `${name} é uma peça colecionável da coleção ${collection}, criada para exploradores do ecossistema Jungle.`,
  collection,
  creator,
  imageUrl: `/assets/ape-${(['emerald', 'golden', 'ivory', 'sage'] as const)[index % 4]}.webp`,
  accent,
  featured: index < 3,
  version: 1,
  editions: [
    { id: `ed_${index + 1}_standard`, label: 'Standard', priceEth: price, available: index === 11 ? 0 : 8 + index },
    { id: `ed_${index + 1}_rare`, label: 'Rare', priceEth: new Decimal(price).times('1.65').toFixed(3), available: index % 5 === 0 ? 0 : 3 },
  ],
  properties: [
    { trait: 'Universo', value: collection },
    { trait: 'Raridade', value: index % 3 === 0 ? 'Lendário' : index % 2 === 0 ? 'Raro' : 'Épico' },
    { trait: 'Geração', value: String((index % 4) + 1) },
  ],
}))
