import fs from 'fs'
import { elements } from './src/utils/elements'

const issues = []
for (const el of elements) {
  // Check covalent issues
  if (el.supports_covalent) {
    if (el.primary_covalent_valency === undefined) {
      issues.push(`${el.symbol}: supports_covalent but no primary_covalent_valency`)
    }
    if (el.max_covalent_slots === undefined) {
      issues.push(`${el.symbol}: supports_covalent but no max_covalent_slots`)
    }
  }

  // Check ionic issues
  if (el.supports_ionic) {
    if (el.primary_ionic_charge === undefined && el.fixed_ionic_charge === undefined) {
      issues.push(`${el.symbol}: supports_ionic but no ionic_charge`)
    }
  }

  // Common oxidation states check for main group
  if (el.group_number === 1 && el.primary_ionic_charge !== 1)
    issues.push(`${el.symbol}: Group 1 but charge !== 1`)
  if (el.group_number === 2 && el.primary_ionic_charge !== 2)
    issues.push(`${el.symbol}: Group 2 but charge !== 2`)
  if (el.group_number === 17 && (!el.supports_covalent || el.primary_covalent_valency !== 1))
    issues.push(`${el.symbol}: Halogen but valency !== 1`)
  if (el.group_number === 16 && (!el.supports_covalent || el.primary_covalent_valency !== 2))
    issues.push(`${el.symbol}: Chalcogen but valency !== 2`)
}
console.log(JSON.stringify(issues, null, 2))

console.log(
  'Valencies:',
  elements
    .filter((e) => e.supports_covalent)
    .map((e) => `${e.symbol}(${e.primary_covalent_valency})`)
    .join(', ')
)
console.log(
  'Charges:',
  elements
    .filter((e) => e.is_metal && (e.primary_ionic_charge || e.fixed_ionic_charge))
    .map((e) => `${e.symbol}(${e.primary_ionic_charge || e.fixed_ionic_charge})`)
    .join(', ')
)
