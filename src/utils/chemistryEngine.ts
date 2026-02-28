import { elements } from '@/utils/elements'
import { getGreekPrefix } from '@/utils/prefixes'

// ─── Result Type ─────────────────────────────────────────────────────────────

export interface BondAttemptResult {
  success: boolean
  reason?: 'capacity_reached' | 'incompatible'
  newCompound?: {
    name: string
    formula: string
    icon: string
    components: Record<string, number>
    current_occupied_slots: number
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Converts a number to a Unicode subscript string (e.g. 2 → "₂")
function toSubscript(n: number): string {
  if (n === 1) return ''
  const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
  return String(n)
    .split('')
    .map((d) => subscripts[parseInt(d)])
    .join('')
}

/**
 * Priority order for element ordering in nomenclature.
 * Based on the IUPAC convention for binary covalent naming:
 * B - Si - C - Sb - As - P - N - H - S - I - Br - Cl - O - F
 * Lower index = listed first (is the "first" / more electropositive element).
 * Elements not in this list (should not appear, but fallback to Infinity).
 */
const NOMENCLATURE_PRIORITY: string[] = [
  'B',
  'Si',
  'C',
  'Sb',
  'As',
  'P',
  'N',
  'H',
  'S',
  'I',
  'Br',
  'Cl',
  'O',
  'F'
]

function getNomenclaturePriority(symbol: string): number {
  const idx = NOMENCLATURE_PRIORITY.indexOf(symbol)
  return idx === -1 ? Infinity : idx
}

/**
 * Combines a prefix with an element name, handling vowel elision.
 * Standard nomenclature (and Indonesian convention) drops the terminal 'a' or 'o'
 * from the prefix if the element name starts with 'o'.
 */
function applyPrefix(prefix: string, name: string): string {
  const p = prefix.toLowerCase()
  const n = name.toLowerCase()

  // Only elide for 'a' or 'o' endings when followed by 'o' (e.g. Monoksida, Tetroksida)
  if ((p.endsWith('a') || p.endsWith('o')) && n.startsWith('o')) {
    return capitalize(p.slice(0, -1) + n)
  }

  return capitalize(p + n)
}

// ─── Core Logic ──────────────────────────────────────────────────────────────

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/**
 * Attempts to merge two compounds (or atoms) based on their slot capacity and electronegativity.
 */
export function attemptBond(
  targetComps: Record<string, number>,
  attachmentComps: Record<string, number>
): BondAttemptResult {
  let newComps: Record<string, number> = {}

  const targetKeys = Object.keys(targetComps)
  const attachmentKeys = Object.keys(attachmentComps)

  // 1. Check for Saturated Polymerization (Matching Base Units)
  const isTargetSingleAtom = targetKeys.length === 1 && targetComps[targetKeys[0]] === 1
  const isAttachmentSingleAtom =
    attachmentKeys.length === 1 && attachmentComps[attachmentKeys[0]] === 1

  if (!isTargetSingleAtom && !isAttachmentSingleAtom) {
    if (isSameBasePolymer(targetComps, attachmentComps)) {
      if (isMoleculeSaturated(targetComps) && isMoleculeSaturated(attachmentComps)) {
        // Calculate the proposed central atom count
        const centralSym = getCentralAtom(targetComps)
        if (centralSym) {
          const targetCentralCount = targetComps[centralSym] || 0
          const attachmentCentralCount = attachmentComps[centralSym] || 0
          const totalCentral = targetCentralCount + attachmentCentralCount

          if (totalCentral <= 4) {
            // Polymerization Success!
            for (const sym of new Set([...targetKeys, ...attachmentKeys])) {
              newComps[sym] = (targetComps[sym] || 0) + (attachmentComps[sym] || 0)
            }

            const { name, formula } = generateNomenclature(newComps)
            return {
              success: true,
              newCompound: {
                name,
                formula,
                icon: '/src/assets/icons/covalent.svg',
                components: newComps,
                current_occupied_slots: 999
              }
            }
          } else {
            // Reject: Complexity limit exceeded (Max 4 central atoms)
            return { success: false, reason: 'capacity_reached' }
          }
        }
      } else {
        // Reject: Unsaturated molecules cannot polymerize (e.g., H2S + H2S)
        return { success: false, reason: 'capacity_reached' }
      }
    }
  }

  if (isTargetSingleAtom && isAttachmentSingleAtom) {
    const symA = targetKeys[0]
    const symB = attachmentKeys[0]

    const elA = elements.find((e) => e.symbol === symA)
    const elB = elements.find((e) => e.symbol === symB)

    if (elA && elB && elA.supports_covalent && elB.supports_covalent) {
      if (symA === symB) {
        newComps = { [symA]: 2 }
      } else if (
        elA.primary_covalent_valency !== undefined &&
        elB.primary_covalent_valency !== undefined
      ) {
        const priorityA = getNomenclaturePriority(symA)
        const priorityB = getNomenclaturePriority(symB)

        const [firstSym, secondSym] = priorityA <= priorityB ? [symA, symB] : [symB, symA]
        const [valFirst, valSecond] =
          priorityA <= priorityB
            ? [elA.primary_covalent_valency, elB.primary_covalent_valency]
            : [elB.primary_covalent_valency, elA.primary_covalent_valency]

        const divisor = gcd(valFirst, valSecond)
        const countFirst = valSecond / divisor
        const countSecond = valFirst / divisor

        newComps = {
          [firstSym]: countFirst,
          [secondSym]: countSecond
        }
      } else {
        newComps = { [symA]: 1, [symB]: 1 }
      }
    } else {
      return { success: false, reason: 'incompatible' }
    }
  } else {
    // Combine components normally for slot-based addition
    newComps = { ...targetComps }
    for (const [sym, count] of Object.entries(attachmentComps)) {
      newComps[sym] = (newComps[sym] || 0) + count
    }
  }

  // Find central atom (lowest EN, excluding H)
  let centralSym: string | null = null
  let lowestEN = Infinity

  for (const sym of Object.keys(newComps)) {
    const el = elements.find((e) => e.symbol === sym)
    if (!el || !el.supports_covalent) return { success: false, reason: 'incompatible' }

    // Skip Hydrogen as central if there are other atoms
    if (sym === 'H' && Object.keys(newComps).length > 1) continue

    const en = el.electronegativity ?? Infinity
    if (en < lowestEN) {
      lowestEN = en
      centralSym = sym
    }
  }

  if (!centralSym) {
    centralSym = Object.keys(newComps)[0]
  }

  const centralEl = elements.find((e) => e.symbol === centralSym)
  if (!centralEl) return { success: false, reason: 'incompatible' }

  // Calculate occupied slots
  let occupied = 0
  for (const [sym, count] of Object.entries(newComps)) {
    if (sym === centralSym) {
      // Central atom takes max_covalent_slots.
      // Other atoms of the EXACT SAME type count as attachments.
      const attCount = count - 1
      if (attCount > 0) {
        occupied += (centralEl.valence_requirement ?? 0) * attCount
      }
    } else {
      const el = elements.find((e) => e.symbol === sym)
      occupied += (el?.valence_requirement ?? 0) * count
    }
  }

  // Reject if over capacity
  if (occupied > (centralEl.max_covalent_slots ?? 0)) {
    return { success: false, reason: 'capacity_reached' }
  }

  const { name, formula } = generateNomenclature(newComps)

  return {
    success: true,
    newCompound: {
      name,
      formula,
      icon: '/src/assets/icons/covalent.svg',
      components: newComps,
      current_occupied_slots: occupied
    }
  }
}

function generateNomenclature(comps: Record<string, number>): { name: string; formula: string } {
  // Sort elements by IUPAC priority
  const syms = Object.keys(comps).sort(
    (a, b) => getNomenclaturePriority(a) - getNomenclaturePriority(b)
  )

  let formula = ''
  for (const sym of syms) {
    const count = comps[sym]
    formula += `${sym}${toSubscript(count)}`
  }

  if (syms.length === 1) {
    const sym = syms[0]
    const count = comps[sym]
    const el = elements.find((e) => e.symbol === sym)!
    if (count === 1) return { name: capitalize(el.name), formula }
    return { name: applyPrefix(getGreekPrefix(count), el.name), formula }
  }

  const nameParts = []
  for (let i = 0; i < syms.length; i++) {
    const sym = syms[i]
    const count = comps[sym]
    const el = elements.find((e) => e.symbol === sym)!
    const isFirst = i === 0
    const isLast = i === syms.length - 1

    let partName = ''
    if (isLast) {
      partName = el.ide_name ?? decapitalize(el.name) + 'ida'
      // Always add prefix for the last element
      nameParts.push(applyPrefix(getGreekPrefix(count), partName))
    } else {
      partName = isFirst ? capitalize(el.name) : decapitalize(el.name)
      // Omit "Mono" for the first element
      if (count === 1 && isFirst) {
        nameParts.push(partName)
      } else {
        nameParts.push(applyPrefix(getGreekPrefix(count), partName))
      }
    }
  }

  return { name: nameParts.join(' '), formula }
}

function getBaseUnit(comps: Record<string, number>): Record<string, number> {
  const counts = Object.values(comps)
  if (counts.length === 0) return {}

  const divisor = counts.reduce((acc, curr) => gcd(acc, curr))
  const base: Record<string, number> = {}

  for (const [sym, count] of Object.entries(comps)) {
    base[sym] = count / divisor
  }
  return base
}

function isSameBasePolymer(compA: Record<string, number>, compB: Record<string, number>): boolean {
  const baseA = getBaseUnit(compA)
  const baseB = getBaseUnit(compB)

  const keysA = Object.keys(baseA)
  const keysB = Object.keys(baseB)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (baseA[key] !== baseB[key]) return false
  }

  return true
}

function getCentralAtom(comps: Record<string, number>): string | null {
  let centralSym: string | null = null
  let lowestEN = Infinity

  for (const sym of Object.keys(comps)) {
    const el = elements.find((e) => e.symbol === sym)
    if (!el) continue

    if (sym === 'H' && Object.keys(comps).length > 1) continue

    const en = el.electronegativity ?? Infinity
    if (en < lowestEN) {
      lowestEN = en
      centralSym = sym
    }
  }

  return centralSym || Object.keys(comps)[0] || null
}

function isMoleculeSaturated(comps: Record<string, number>): boolean {
  const centralSym = getCentralAtom(comps)
  if (!centralSym) return false

  const centralEl = elements.find((e) => e.symbol === centralSym)
  if (!centralEl) return false

  let occupied = 0
  for (const [sym, count] of Object.entries(comps)) {
    if (sym === centralSym) {
      const attCount = count - 1
      if (attCount > 0) {
        occupied += (centralEl.valence_requirement ?? 0) * attCount
      }
    } else {
      const el = elements.find((e) => e.symbol === sym)
      occupied += (el?.valence_requirement ?? 0) * count
    }
  }

  // Returns true if current occupied slots are equal to or greater than the maximum allowed
  return occupied >= (centralEl.max_covalent_slots ?? 0)
}

// ─── String Utilities ─────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function decapitalize(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}
