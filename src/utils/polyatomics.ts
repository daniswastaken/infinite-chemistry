import type { PolyatomicIon } from '@/utils/elements'

export const polyatomics: PolyatomicIon[] = [
  {
    id: 'hydroxide',
    formula: 'OH',
    name: 'Hidroksida',
    charge: -1,
    is_cation: false
  },
  {
    id: 'sulfate',
    formula: 'SO4',
    name: 'Sulfat',
    charge: -2,
    is_cation: false
  },
  {
    id: 'nitrate',
    formula: 'NO3',
    name: 'Nitrat',
    charge: -1,
    is_cation: false
  },
  {
    id: 'carbonate',
    formula: 'CO3',
    name: 'Karbonat',
    charge: -2,
    is_cation: false
  },
  {
    id: 'phosphate',
    formula: 'PO4',
    name: 'Fosfat',
    charge: -3,
    is_cation: false
  },
  {
    id: 'ammonium',
    formula: 'NH4',
    name: 'Amonium',
    charge: 1,
    is_cation: true
  },
  {
    id: 'sulfite',
    formula: 'SO3',
    name: 'Sulfit',
    charge: -2,
    is_cation: false
  },
  {
    id: 'nitrite',
    formula: 'NO2',
    name: 'Nitrit',
    charge: -1,
    is_cation: false
  },
  {
    id: 'phosphite',
    formula: 'PO3',
    name: 'Fosfit',
    charge: -3,
    is_cation: false
  }
]
