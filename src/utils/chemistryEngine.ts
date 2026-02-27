import { elements } from '@/utils/elements'
import { getGreekPrefix } from '@/utils/prefixes'

// ─── Result Type ─────────────────────────────────────────────────────────────

export interface MixResult {
  name: string // Indonesian compound name, e.g. "Dihidrogen Monoksida"
  formula: string // Chemical formula, e.g. "H₂O"
  bondType: 'covalent'
  icon: string // Path to bond-type icon SVG
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
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

/**
 * Attempts to form a binary covalent compound from two element symbols.
 * Returns null if either element does not support covalent bonding.
 */
function covalentMix(symbolA: string, symbolB: string): MixResult | null {
  const elA = elements.find((e) => e.symbol === symbolA)
  const elB = elements.find((e) => e.symbol === symbolB)

  if (!elA || !elB) return null
  if (!elA.supports_covalent || !elB.supports_covalent) return null
  if (elA.primary_covalent_valency === undefined || elB.primary_covalent_valency === undefined)
    return null

  const valA = elA.primary_covalent_valency
  const valB = elB.primary_covalent_valency

  // ── Special case: same element + same element → diatomic molecule ──────────
  if (symbolA === symbolB) {
    const prefix = getGreekPrefix(2) // "Di"
    const name = applyPrefix(prefix, elA.name)
    const formula = `${symbolA}${toSubscript(2)}`
    return {
      name,
      formula,
      bondType: 'covalent',
      icon: '/src/assets/icons/covalent.svg'
    }
  }

  // ── Determine correct nomenclature order ───────────────────────────────────
  const priorityA = getNomenclaturePriority(symbolA)
  const priorityB = getNomenclaturePriority(symbolB)

  // "first" element is the one listed earlier in the priority order
  const [first, second] = priorityA <= priorityB ? [elA, elB] : [elB, elA]
  const [valFirst, valSecond] = priorityA <= priorityB ? [valA, valB] : [valB, valA]

  // ── Cross-multiply with GCD reduction to get atom counts ──────────────────
  const divisor = gcd(valFirst, valSecond)
  const countFirst = valSecond / divisor
  const countSecond = valFirst / divisor

  // ── Build Indonesian compound name ────────────────────────────────────────
  // First element: omit "Mono" if count is 1, otherwise use Greek prefix + name
  const firstPart =
    countFirst === 1 ? capitalize(first.name) : applyPrefix(getGreekPrefix(countFirst), first.name)

  // Second element: always include "Mono" even if count is 1 + ide_name
  const secondIde = second.ide_name ?? decapitalize(second.name) + 'ida'
  const secondPart = applyPrefix(getGreekPrefix(countSecond), secondIde)

  const name = `${firstPart} ${secondPart}`

  // ── Build formula string ───────────────────────────────────────────────────
  const formula = `${first.symbol}${toSubscript(countFirst)}${second.symbol}${toSubscript(countSecond)}`

  return {
    name,
    formula,
    bondType: 'covalent',
    icon: '/src/assets/icons/covalent.svg'
  }
}

// ─── String Utilities ─────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function decapitalize(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Main entry point. Given two element symbols, tries to produce a valid
 * chemical compound. Currently handles binary covalent bonding only.
 *
 * @param symbolA - Element symbol (e.g. "H", "O", "C")
 * @param symbolB - Second element symbol
 * @returns MixResult describing the compound, or null if no valid bond exists
 */
export function mixElements(symbolA: string, symbolB: string): MixResult | null {
  return covalentMix(symbolA, symbolB)
}
