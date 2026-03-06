import { elements } from '@/utils/elements'
import type { ElementInfo, AtomicIon } from '@/utils/elements'
import { atomicIons } from '@/utils/atomicIons'
import { attemptBond, attemptAtomicBond, reachableAtomicIonIds } from '@/utils/chemistryEngine'
import type { BondAttemptResult } from '@/utils/chemistryEngine'

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max)
}

function getRandomElement(): ElementInfo {
  // Filter out elements that generally don't bond well or aren't supported
  const bondableElements = elements.filter((e) => e.supports_covalent || e.supports_ionic)
  return bondableElements[getRandomInt(bondableElements.length)]
}

function getRandomAtomicIon(): AtomicIon {
  const reachable = atomicIons.filter((ion) => reachableAtomicIonIds.has(ion.id))
  return reachable[getRandomInt(reachable.length)]
}

export function generateRandomTarget(): NonNullable<BondAttemptResult['newCompound']> | null {
  const maxAttempts = 100

  for (let i = 0; i < maxAttempts; i++) {
    // 50% chance for atomic/ionic bond, 50% chance for covalent bond attempt
    const isAtomicAttempt = Math.random() > 0.5

    if (isAtomicAttempt) {
      // Try to bond two things, at least one being atomic
      const targetIsAtomic = Math.random() > 0.5
      const attachIsAtomic = Math.random() > 0.5 || !targetIsAtomic // Ensure at least one is atomic

      const targetId = targetIsAtomic ? getRandomAtomicIon().id : null
      const targetSym = !targetIsAtomic ? getRandomElement().symbol : null

      const attachId = attachIsAtomic ? getRandomAtomicIon().id : null
      const attachSym = !attachIsAtomic ? getRandomElement().symbol : null

      const result = attemptAtomicBond(targetId, targetSym, attachId, attachSym)

      if (result.success && result.newCompound) {
        return result.newCompound
      }
    } else {
      // Try to bond two elements covalently or simple ionic
      const el1 = getRandomElement()
      const el2 = getRandomElement()

      // We pass in the components as if they are single boxes
      const comps1 = { [el1.symbol]: 1 }
      const comps2 = { [el2.symbol]: 1 }

      // Standard bond (Covalent or Simple Ionic depending on elements)
      const result = attemptBond(comps1, comps2, false)

      // Reject targets that are just single elements (e.g. O2 is a bit too simple usually, but we allow it if it succeeds. We mainly want to avoid a "bond" that just results in the same atom without bonding properly, though attemptBond shouldn't do that)
      // Actually, H2, O2, NaCl are all great.
      if (
        result.success &&
        result.newCompound &&
        Object.keys(result.newCompound.components).length >= 1
      ) {
        return result.newCompound
      }
    }
  }

  // Fallback if random generation fails after 100 tries
  return {
    name: 'Air',
    formula: 'H₂O',
    icon: '', // Fallback URL if needed
    components: { H: 2, O: 1 },
    current_occupied_slots: 0,
    bondType: 'covalent'
  }
}
