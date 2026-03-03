import type { PolyatomicIon } from '@/utils/elements'

export const polyatomics: PolyatomicIon[] = [
  // Existing
  { id: 'hydroxide', formula: 'OH', name: 'Hidroksida', charge: -1, is_cation: false },
  { id: 'sulfate', formula: 'SO4', name: 'Sulfat', charge: -2, is_cation: false },
  { id: 'nitrate', formula: 'NO3', name: 'Nitrat', charge: -1, is_cation: false },
  { id: 'carbonate', formula: 'CO3', name: 'Karbonat', charge: -2, is_cation: false },
  { id: 'phosphate', formula: 'PO4', name: 'Fosfat', charge: -3, is_cation: false },
  { id: 'ammonium', formula: 'NH4', name: 'Amonium', charge: 1, is_cation: true },
  { id: 'sulfite', formula: 'SO3', name: 'Sulfit', charge: -2, is_cation: false },
  { id: 'nitrite', formula: 'NO2', name: 'Nitrit', charge: -1, is_cation: false },
  { id: 'phosphite', formula: 'PO3', name: 'Fosfit', charge: -3, is_cation: false },

  // --- NEW Halogen Oxyanions ---
  // Chlorine (Existing: None)
  { id: 'hypochlorite', formula: 'ClO', name: 'Hipoklorit', charge: -1, is_cation: false },
  { id: 'chlorite', formula: 'ClO2', name: 'Klorit', charge: -1, is_cation: false },
  { id: 'chlorate', formula: 'ClO3', name: 'Klorat', charge: -1, is_cation: false },
  { id: 'perchlorate', formula: 'ClO4', name: 'Perklorat', charge: -1, is_cation: false },
  // Bromine
  { id: 'hypobromite', formula: 'BrO', name: 'Hipobromit', charge: -1, is_cation: false },
  { id: 'bromite', formula: 'BrO2', name: 'Bromit', charge: -1, is_cation: false },
  { id: 'bromate', formula: 'BrO3', name: 'Bromat', charge: -1, is_cation: false },
  { id: 'perbromate', formula: 'BrO4', name: 'Perbromat', charge: -1, is_cation: false },
  // Iodine
  { id: 'hypoiodite', formula: 'IO', name: 'Hipoyodit', charge: -1, is_cation: false },
  { id: 'iodite', formula: 'IO2', name: 'Yodit', charge: -1, is_cation: false },
  { id: 'iodate', formula: 'IO3', name: 'Yodat', charge: -1, is_cation: false },
  { id: 'periodate', formula: 'IO4', name: 'Peryodat', charge: -1, is_cation: false },

  // --- Phosphorus Extensions ---
  { id: 'hypophosphite', formula: 'PO2', name: 'Hipofosfit', charge: -3, is_cation: false },
  {
    id: 'hydrogen_phosphate',
    formula: 'HPO4',
    name: 'Hidrogen Fosfat',
    charge: -2,
    is_cation: false
  },
  {
    id: 'dihydrogen_phosphate',
    formula: 'H2PO4',
    name: 'Dihidrogen Fosfat',
    charge: -1,
    is_cation: false
  },

  // --- Sulfur Extensions ---
  { id: 'thiosulfate', formula: 'S2O3', name: 'Tiosulfat', charge: -2, is_cation: false },
  { id: 'bisulfate', formula: 'HSO4', name: 'Bisulfat', charge: -1, is_cation: false },

  // --- Carbon Extensions ---
  { id: 'bicarbonate', formula: 'HCO3', name: 'Bikarbonat', charge: -1, is_cation: false },
  { id: 'oxalate', formula: 'C2O4', name: 'Oksalat', charge: -2, is_cation: false },
  { id: 'acetate', formula: 'CH3COO', name: 'Asetat', charge: -1, is_cation: false },

  // --- Transition Metals ---
  { id: 'permanganate', formula: 'MnO4', name: 'Permanganat', charge: -1, is_cation: false },
  { id: 'manganate', formula: 'MnO4', name: 'Manganat', charge: -2, is_cation: false },
  { id: 'chromate', formula: 'CrO4', name: 'Kromat', charge: -2, is_cation: false },
  { id: 'dichromate', formula: 'Cr2O7', name: 'Dikromat', charge: -2, is_cation: false },

  // --- Others ---
  { id: 'cyanide', formula: 'CN', name: 'Sianida', charge: -1, is_cation: false },
  { id: 'cyanate', formula: 'OCN', name: 'Sianat', charge: -1, is_cation: false },
  { id: 'thiocyanate', formula: 'SCN', name: 'Tiosianat', charge: -1, is_cation: false },
  { id: 'peroxide', formula: 'O2', name: 'Peroksida', charge: -2, is_cation: false },
  { id: 'silicate', formula: 'SiO3', name: 'Silikat', charge: -2, is_cation: false },
  { id: 'borate', formula: 'BO3', name: 'Borat', charge: -3, is_cation: false },
  { id: 'aluminate', formula: 'AlO2', name: 'Aluminat', charge: -1, is_cation: false },
  { id: 'zincate', formula: 'ZnO2', name: 'Zinkat', charge: -2, is_cation: false }
]
