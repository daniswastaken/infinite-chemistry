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
    bondType: 'covalent' | 'ionic' | 'pre-bond-cluster'
  }
}

// ─── Preload Icons ───────────────────────────────────────────────────────────

const COVALENT_ICON_URL = new URL('../assets/icons/covalent.svg', import.meta.url).href
const IONIC_ICON_URL = new URL('../assets/icons/ionic.svg', import.meta.url).href

if (typeof Image !== 'undefined') {
  new Image().src = COVALENT_ICON_URL
  new Image().src = IONIC_ICON_URL
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function decapitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toLowerCase() + s.slice(1)
}

// Converts a number to a Unicode subscript string (e.g. 2 → "₂")
function toSubscript(n: number): string {
  if (n === 1) return ''
  const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
  return String(n)
    .split('')
    .map((d) => subscripts[parseInt(d)])
    .join('')
}

// Converts a number to an uppercase Roman numeral (e.g. 3 → "III")
function toRomanNumeral(n: number): string {
  const romans: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
    10: 'X'
  }
  return romans[n] || String(n)
}

/**
 * Priority order for element ordering in nomenclature.
 * Based on the IUPAC convention for binary covalent naming:
 * B - Si - C - Sb - As - P - N - H - S - I - Br - Cl - O - F
 * Lower index = listed first (is the "first" / more electropositive element).
 * Elements not in this list (should not appear, but fallback to Infinity).
 */
const NOMENCLATURE_PRIORITY: string[] = [
  'Xe',
  'Kr',
  'Ar',
  'Ne',
  'He',
  'Al',
  'B',
  'Si',
  'C',
  'Sb',
  'Te',
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

function isStable(comps: Record<string, number>): boolean {
  const syms = Object.keys(comps)
  if (syms.length < 2) return false

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

  return occupied >= (centralEl.primary_covalent_valency ?? 0)
}

// ─── Core Logic ──────────────────────────────────────────────────────────────

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

// ─── Ionic Bonding ───────────────────────────────────────────────────────────

/**
 * Handles binary ionic bond formation between a metal cation and a non-metal anion.
 * Uses charge cross-over with GCD simplification for empirical formulas.
 * Nomenclature follows Indonesian standards:
 *   - Fixed-charge metals: "[Metal] [Anion]" (e.g. Natrium Klorida)
 *   - Variable-charge metals: "[Metal](Roman) [Anion]" (e.g. Besi(III) Klorida)
 */
function handleIonicBond(
  metalEl: (typeof elements)[number],
  nonMetalEl: (typeof elements)[number]
): BondAttemptResult {
  // Determine charges
  // Metal (cation): use fixed_ionic_charge if available, otherwise primary_ionic_charge
  const cationCharge = metalEl.fixed_ionic_charge ?? metalEl.primary_ionic_charge ?? 0
  // Non-metal (anion): use the absolute value of the charge
  const anionCharge = Math.abs(
    nonMetalEl.fixed_ionic_charge ?? nonMetalEl.primary_ionic_charge ?? 0
  )

  if (cationCharge <= 0 || anionCharge <= 0) {
    return { success: false, reason: 'incompatible' }
  }

  // Cross-over and simplify by GCD for the empirical formula
  const common = gcd(cationCharge, anionCharge)
  const metalCount = anionCharge / common
  const nonMetalCount = cationCharge / common

  const newComps: Record<string, number> = {
    [metalEl.symbol]: metalCount,
    [nonMetalEl.symbol]: nonMetalCount
  }

  // Formula: Metal first, then non-metal, with subscripts
  const formula = `${metalEl.symbol}${toSubscript(metalCount)}${nonMetalEl.symbol}${toSubscript(nonMetalCount)}`

  // Name (Indonesian ionic naming)
  const anionName = capitalize(nonMetalEl.anion_name || nonMetalEl.name.toLowerCase() + 'ida')

  let name = ''
  if (metalEl.fixed_ionic_charge !== undefined) {
    // Fixed charge → no Roman numerals (e.g. "Natrium Klorida")
    name = `${capitalize(metalEl.name)} ${anionName}`
  } else {
    // Variable charge → include Roman numerals (e.g. "Besi(III) Klorida")
    name = `${capitalize(metalEl.name)}(${toRomanNumeral(cationCharge)}) ${anionName}`
  }

  return {
    success: true,
    newCompound: {
      name,
      formula,
      icon: IONIC_ICON_URL,
      components: newComps,
      current_occupied_slots: 999, // Ionic compounds are fully satisfied
      bondType: 'ionic'
    }
  }
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

/**
 * Attempts to merge two compounds (or atoms) based on their slot capacity and electronegativity.
 */
export function attemptBond(
  targetComps: Record<string, number>,
  attachmentComps: Record<string, number>
): BondAttemptResult {
  // Collect all unique symbols from both sides
  const allSyms = new Set([...Object.keys(targetComps), ...Object.keys(attachmentComps)])

  const targetKeys = Object.keys(targetComps)
  const attachmentKeys = Object.keys(attachmentComps)

  const elA = elements.find((e) => e.symbol === targetKeys[0])
  const elB = elements.find((e) => e.symbol === attachmentKeys[0])
  const isNobleA =
    elA?.group_number === 18 && targetKeys.length === 1 && targetComps[targetKeys[0]] === 1
  const isNobleB =
    elB?.group_number === 18 &&
    attachmentKeys.length === 1 &&
    attachmentComps[attachmentKeys[0]] === 1

  // Helper to check if all elements in a comp are metals
  const isAllMetal = (comps: Record<string, number>) =>
    Object.keys(comps).every((sym) => elements.find((e) => e.symbol === sym)?.is_metal ?? false)

  // ─── Step 0.1: Reject Metal + Metal combinations (No Reaction) ──────────
  if (isAllMetal(targetComps) && isAllMetal(attachmentComps)) {
    return { success: false, reason: 'incompatible' }
  }

  // ─── Step 0.2: Ionic Bond Detection ──────────────────────────────────────
  // Route to ionic bonding if BOTH sides are single element boxes and combined set is Metal + Non-metal.
  if (targetKeys.length === 1 && attachmentKeys.length === 1 && allSyms.size === 2) {
    const symArr = [...allSyms]
    const elA = elements.find((e) => e.symbol === symArr[0])
    const elB = elements.find((e) => e.symbol === symArr[1])

    if (elA && elB && elA.supports_ionic && elB.supports_ionic) {
      const metalEl = elA.is_metal ? elA : elB.is_metal ? elB : null
      const nonMetalEl = !elA.is_metal ? elA : !elB.is_metal ? elB : null

      if (metalEl && nonMetalEl) {
        return handleIonicBond(metalEl, nonMetalEl)
      }
    }
  }

  // ─── Step 1+: Covalent Logic ──────────────────────────────────────────

  let newComps: Record<string, number> = {}

  // 1. Check for Saturated Polymerization (Matching Base Units)
  const isTargetSingleAtom = targetKeys.length === 1 && targetComps[targetKeys[0]] === 1
  const isAttachmentSingleAtom =
    attachmentKeys.length === 1 && attachmentComps[attachmentKeys[0]] === 1

  if (!isTargetSingleAtom && !isAttachmentSingleAtom) {
    if (isSameBasePolymer(targetComps, attachmentComps)) {
      const isTargetDimerEx = isStrictDimerException(targetComps)
      const isAttachDimerEx = isStrictDimerException(attachmentComps)

      if (
        (isMoleculeSaturated(targetComps) && isMoleculeSaturated(attachmentComps)) ||
        (isTargetDimerEx && isAttachDimerEx)
      ) {
        // Calculate the proposed central atom count
        const centralSym = getCentralAtom(targetComps)
        if (centralSym) {
          const centralEl = elements.find((e) => e.symbol === centralSym)

          // Octet Limit & Metal Check: Reject polymerization if central atom is from Period 1 & 2 (atomic ≤ 10)
          // or if it doesn't support covalent bonding.
          // EXCEPTION: Aluminum (Al) in AlCl3 is allowed via isStrictDimerException.
          if (
            centralEl &&
            (centralEl.atomicNumber <= 10 || !centralEl.supports_covalent) &&
            !isTargetDimerEx
          ) {
            return { success: false, reason: 'capacity_reached' }
          }

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
                icon: COVALENT_ICON_URL,
                components: newComps,
                current_occupied_slots: 999,
                bondType: 'covalent'
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

    if (elA && elB) {
      const isHydrogenA = symA === 'H'
      const isHydrogenB = symB === 'H'

      if (elA.supports_covalent && elB.supports_covalent) {
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
        }
      } else {
        return { success: false, reason: 'incompatible' }
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
    if (!el) return { success: false, reason: 'incompatible' }

    if (!el.supports_covalent) {
      return { success: false, reason: 'incompatible' }
    }

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

  // --- Saturation Check for Atom Addition ---
  // If one side is an atom, reject if the other side already met primary valency.
  const isOneSideAtom = isTargetSingleAtom || isAttachmentSingleAtom
  if (isOneSideAtom && !isNobleA && !isNobleB) {
    // Check if target was already stable
    const targetSaturated = !isTargetSingleAtom && targetComps[centralSym] && isStable(targetComps)
    const attachSaturated =
      !isAttachmentSingleAtom && attachmentComps[centralSym] && isStable(attachmentComps)
    if (targetSaturated || attachSaturated) {
      return { success: false, reason: 'capacity_reached' }
    }
  }

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

  // Reject if over capacity (scale capacity by number of central atoms)
  const totalCapacity = (centralEl.max_covalent_slots ?? 0) * (newComps[centralSym] || 1)
  if (occupied > totalCapacity) {
    return { success: false, reason: 'capacity_reached' }
  }

  const { name, formula } = generateNomenclature(newComps)

  return {
    success: true,
    newCompound: {
      name,
      formula,
      icon: COVALENT_ICON_URL,
      components: newComps,
      current_occupied_slots: occupied,
      bondType: 'covalent'
    }
  }
}

export function generateNomenclature(comps: Record<string, number>): {
  name: string
  formula: string
} {
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
  const totalCapacity = (centralEl.max_covalent_slots ?? 0) * (comps[centralSym] || 1)
  return occupied >= totalCapacity
}

function isStrictDimerException(comps: Record<string, number>): boolean {
  const keys = Object.keys(comps)
  if (keys.length !== 2) return false

  // AlCl3
  if (comps['Al'] === 1 && comps['Cl'] === 3 && keys.length === 2) return true

  // ClO3
  if (comps['Cl'] === 1 && comps['O'] === 3 && keys.length === 2) return true

  return false
}
