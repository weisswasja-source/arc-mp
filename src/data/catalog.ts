/**
 * The Arc Raiders item catalog. It's static game data, so it ships with the
 * code and is shared by the browser and the server (which validates item ids).
 */
import type { Category, Item, Rarity } from './types'

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'weapon', label: 'Waffen' },
  { id: 'gear', label: 'Ausrüstung' },
  { id: 'material', label: 'Materialien' },
  { id: 'arc', label: 'ARC-Teile' },
  { id: 'blueprint', label: 'Blaupausen' },
  { id: 'key', label: 'Schlüssel' },
]

export const RARITIES: { id: Rarity; label: string }[] = [
  { id: 'common', label: 'Gewöhnlich' },
  { id: 'uncommon', label: 'Ungewöhnlich' },
  { id: 'rare', label: 'Selten' },
  { id: 'epic', label: 'Episch' },
  { id: 'legendary', label: 'Legendär' },
]

export const ITEMS: Item[] = [
  { id: 'anvil', name: 'Anvil', category: 'weapon', rarity: 'rare' },
  { id: 'ferro', name: 'Ferro', category: 'weapon', rarity: 'common' },
  { id: 'kettle', name: 'Kettle', category: 'weapon', rarity: 'common' },
  { id: 'stitcher', name: 'Stitcher', category: 'weapon', rarity: 'uncommon' },
  { id: 'renegade', name: 'Renegade', category: 'weapon', rarity: 'rare' },
  { id: 'tempest', name: 'Tempest', category: 'weapon', rarity: 'epic' },
  { id: 'venator', name: 'Venator', category: 'weapon', rarity: 'rare' },
  { id: 'jupiter', name: 'Jupiter', category: 'weapon', rarity: 'legendary' },
  { id: 'equalizer', name: 'Equalizer', category: 'weapon', rarity: 'legendary' },
  { id: 'light-shield', name: 'Leichter Schild', category: 'gear', rarity: 'uncommon' },
  { id: 'heavy-shield', name: 'Schwerer Schild', category: 'gear', rarity: 'epic' },
  { id: 'combat-mk2', name: 'Kampf-Augment Mk. 2', category: 'gear', rarity: 'rare' },
  { id: 'looting-mk3', name: 'Plünder-Augment Mk. 3', category: 'gear', rarity: 'epic' },
  { id: 'mech-comp', name: 'Mechanische Komponenten', category: 'material', rarity: 'common' },
  { id: 'adv-elec', name: 'Fortgeschrittene Elektronik', category: 'material', rarity: 'rare' },
  { id: 'rusted-gear', name: 'Rostiges Zahnrad', category: 'material', rarity: 'uncommon' },
  { id: 'mag-accel', name: 'Magnetbeschleuniger', category: 'material', rarity: 'epic' },
  { id: 'power-rod', name: 'Energiestab', category: 'material', rarity: 'epic' },
  { id: 'arc-alloy', name: 'ARC-Legierung', category: 'arc', rarity: 'uncommon' },
  { id: 'arc-circuitry', name: 'ARC-Schaltkreis', category: 'arc', rarity: 'rare' },
  { id: 'arc-motion-core', name: 'ARC-Bewegungskern', category: 'arc', rarity: 'rare' },
  { id: 'leaper-pulse', name: 'Leaper-Pulseinheit', category: 'arc', rarity: 'epic' },
  { id: 'queen-reactor', name: 'Queen-Reaktor', category: 'arc', rarity: 'legendary' },
  { id: 'bp-anvil', name: 'Blaupause: Anvil', category: 'blueprint', rarity: 'rare' },
  { id: 'bp-tempest', name: 'Blaupause: Tempest', category: 'blueprint', rarity: 'epic' },
  { id: 'bp-heavy-shield', name: 'Blaupause: Schwerer Schild', category: 'blueprint', rarity: 'epic' },
  { id: 'key-dam', name: 'Damm-Kontrollraum-Schlüssel', category: 'key', rarity: 'rare' },
  { id: 'key-spaceport', name: 'Raumhafen-Hangar-Schlüssel', category: 'key', rarity: 'epic' },
]

const itemById = new Map(ITEMS.map((i) => [i.id, i]))

export function isItemId(id: string): boolean {
  return itemById.has(id)
}

export function getItem(id: string): Item {
  const item = itemById.get(id)
  if (!item) throw new Error(`Unknown item ${id}`)
  return item
}
