export interface MoleculeInstance {
  centralAtom: ElementInfo
  attachedAtoms: ElementInfo[]
  current_occupied_slots: number
}

export interface ElementInfo {
  atomicNumber: number
  symbol: string
  name: string
  supports_covalent: boolean
  supports_ionic: boolean
  primary_covalent_valency?: number
  max_covalent_slots?: number
  valence_requirement?: number
  electronegativity?: number
  possible_oxidation_states?: number[]
  ide_name?: string
  is_diatomic_element: boolean
  group_number: number | 'lanthanide' | 'actinide'
}

export const elements: ElementInfo[] = [
  {
    atomicNumber: 1,
    symbol: 'H',
    name: 'Hidrogen',
    supports_covalent: true,
    supports_ionic: true,
    primary_covalent_valency: 1,
    max_covalent_slots: 1,
    valence_requirement: 1,
    electronegativity: 2.2,
    possible_oxidation_states: [1, -1],
    ide_name: 'hidrida',
    is_diatomic_element: true,
    group_number: 1
  },
  {
    atomicNumber: 3,
    symbol: 'Li',
    name: 'Litium',
    supports_covalent: false,
    supports_ionic: true,
    electronegativity: 0.98,
    possible_oxidation_states: [1],
    is_diatomic_element: false,
    group_number: 1
  },
  {
    atomicNumber: 4,
    symbol: 'Be',
    name: 'Berilium',
    supports_covalent: false,
    supports_ionic: true,
    electronegativity: 1.57,
    possible_oxidation_states: [2],
    is_diatomic_element: false,
    group_number: 2
  },
  {
    atomicNumber: 5,
    symbol: 'B',
    name: 'Boron',
    supports_covalent: true,
    supports_ionic: false,
    primary_covalent_valency: 3,
    max_covalent_slots: 3,
    valence_requirement: 3,
    electronegativity: 2.04,
    ide_name: 'borida',
    is_diatomic_element: false,
    group_number: 13
  },
  {
    atomicNumber: 6,
    symbol: 'C',
    name: 'Karbon',
    supports_covalent: true,
    supports_ionic: true,
    primary_covalent_valency: 4,
    max_covalent_slots: 4,
    valence_requirement: 4,
    electronegativity: 2.55,
    possible_oxidation_states: [4, 2, -4],
    ide_name: 'karbida',
    is_diatomic_element: false,
    group_number: 14
  },
  {
    atomicNumber: 7,
    symbol: 'N',
    name: 'Nitrogen',
    supports_covalent: true,
    supports_ionic: true,
    primary_covalent_valency: 3,
    max_covalent_slots: 5,
    valence_requirement: 3,
    electronegativity: 3.04,
    possible_oxidation_states: [3, 5, 4, 2, -3],
    ide_name: 'nitrida',
    is_diatomic_element: true,
    group_number: 15
  },
  {
    atomicNumber: 8,
    symbol: 'O',
    name: 'Oksigen',
    supports_covalent: true,
    supports_ionic: true,
    primary_covalent_valency: 2,
    max_covalent_slots: 2,
    valence_requirement: 2,
    electronegativity: 3.44,
    possible_oxidation_states: [-2],
    ide_name: 'oksida',
    is_diatomic_element: true,
    group_number: 16
  },
  {
    atomicNumber: 9,
    symbol: 'F',
    name: 'Fluor',
    supports_covalent: true,
    supports_ionic: true,
    primary_covalent_valency: 1,
    max_covalent_slots: 1,
    valence_requirement: 1,
    electronegativity: 3.98,
    possible_oxidation_states: [-1],
    ide_name: 'fluorida',
    is_diatomic_element: true,
    group_number: 17
  },
  {
    atomicNumber: 11,
    symbol: 'Na',
    name: 'Natrium',
    supports_covalent: false,
    supports_ionic: true,
    electronegativity: 0.93,
    possible_oxidation_states: [1],
    is_diatomic_element: false,
    group_number: 1
  },
  {
    atomicNumber: 12,
    symbol: 'Mg',
    name: 'Magnesium',
    supports_covalent: false,
    supports_ionic: true,
    electronegativity: 1.31,
    possible_oxidation_states: [2],
    is_diatomic_element: false,
    group_number: 2
  },
  {
    atomicNumber: 13,
    symbol: 'Al',
    name: 'Aluminium',
    supports_covalent: false,
    supports_ionic: true,
    electronegativity: 1.61,
    possible_oxidation_states: [3],
    is_diatomic_element: false,
    group_number: 13
  },
  {
    atomicNumber: 14,
    symbol: 'Si',
    name: 'Silikon',
    supports_covalent: true,
    supports_ionic: false,
    primary_covalent_valency: 4,
    max_covalent_slots: 4,
    valence_requirement: 4,
    electronegativity: 1.9,
    ide_name: 'silisida',
    is_diatomic_element: false,
    group_number: 14
  },
  {
    atomicNumber: 15,
    symbol: 'P',
    name: 'Fosfor',
    supports_covalent: true,
    supports_ionic: true,
    primary_covalent_valency: 3,
    max_covalent_slots: 5,
    valence_requirement: 3,
    electronegativity: 2.19,
    possible_oxidation_states: [3, 5, -3],
    ide_name: 'fosfida',
    is_diatomic_element: false,
    group_number: 15
  },
  {
    atomicNumber: 16,
    symbol: 'S',
    name: 'Belerang',
    supports_covalent: true,
    supports_ionic: true,
    primary_covalent_valency: 2,
    max_covalent_slots: 6,
    valence_requirement: 2,
    electronegativity: 2.58,
    possible_oxidation_states: [2, 4, 6, -2],
    ide_name: 'sulfida',
    is_diatomic_element: false,
    group_number: 16
  },
  {
    atomicNumber: 17,
    symbol: 'Cl',
    name: 'Klor',
    supports_covalent: true,
    supports_ionic: true,
    primary_covalent_valency: 1,
    max_covalent_slots: 7,
    valence_requirement: 1,
    electronegativity: 3.16,
    possible_oxidation_states: [1, 3, 5, 7, -1],
    ide_name: 'klorida',
    is_diatomic_element: true,
    group_number: 17
  },
  {
    atomicNumber: 19,
    symbol: 'K',
    name: 'Kalium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [1],
    is_diatomic_element: false,
    group_number: 1
  },
  {
    atomicNumber: 20,
    symbol: 'Ca',
    name: 'Kalsium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2],
    is_diatomic_element: false,
    group_number: 2
  },
  {
    atomicNumber: 21,
    symbol: 'Sc',
    name: 'Skandium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [3],
    is_diatomic_element: false,
    group_number: 3
  },
  {
    atomicNumber: 22,
    symbol: 'Ti',
    name: 'Titanium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [4, 3],
    is_diatomic_element: false,
    group_number: 4
  },
  {
    atomicNumber: 23,
    symbol: 'V',
    name: 'Vanadium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [5, 4, 3, 2],
    is_diatomic_element: false,
    group_number: 5
  },
  {
    atomicNumber: 24,
    symbol: 'Cr',
    name: 'Krom',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [3, 2, 6],
    is_diatomic_element: false,
    group_number: 6
  },
  {
    atomicNumber: 25,
    symbol: 'Mn',
    name: 'Mangan',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2, 4, 7, 3, 6],
    is_diatomic_element: false,
    group_number: 7
  },
  {
    atomicNumber: 26,
    symbol: 'Fe',
    name: 'Besi',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2, 3],
    is_diatomic_element: false,
    group_number: 8
  },
  {
    atomicNumber: 27,
    symbol: 'Co',
    name: 'Kobalt',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2, 3],
    is_diatomic_element: false,
    group_number: 9
  },
  {
    atomicNumber: 28,
    symbol: 'Ni',
    name: 'Nikel',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2, 3],
    is_diatomic_element: false,
    group_number: 10
  },
  {
    atomicNumber: 29,
    symbol: 'Cu',
    name: 'Tembaga',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2, 1],
    is_diatomic_element: false,
    group_number: 11
  },
  {
    atomicNumber: 30,
    symbol: 'Zn',
    name: 'Seng',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2],
    is_diatomic_element: false,
    group_number: 12
  },
  {
    atomicNumber: 31,
    symbol: 'Ga',
    name: 'Galium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [3],
    is_diatomic_element: false,
    group_number: 13
  },
  {
    atomicNumber: 32,
    symbol: 'Ge',
    name: 'Germanium',
    supports_covalent: true,
    supports_ionic: false,
    primary_covalent_valency: 4,
    max_covalent_slots: 4,
    valence_requirement: 4,
    electronegativity: 2.01,
    ide_name: 'germanida',
    is_diatomic_element: false,
    group_number: 14
  },
  {
    atomicNumber: 33,
    symbol: 'As',
    name: 'Arsen',
    supports_covalent: true,
    supports_ionic: false,
    primary_covalent_valency: 3,
    max_covalent_slots: 3,
    valence_requirement: 3,
    electronegativity: 2.18,
    ide_name: 'arsenida',
    is_diatomic_element: false,
    group_number: 15
  },
  {
    atomicNumber: 34,
    symbol: 'Se',
    name: 'Selen',
    supports_covalent: true,
    supports_ionic: true,
    primary_covalent_valency: 2,
    max_covalent_slots: 2,
    valence_requirement: 2,
    electronegativity: 2.55,
    possible_oxidation_states: [4, 6, -2],
    ide_name: 'selenida',
    is_diatomic_element: false,
    group_number: 16
  },
  {
    atomicNumber: 35,
    symbol: 'Br',
    name: 'Brom',
    supports_covalent: true,
    supports_ionic: true,
    primary_covalent_valency: 1,
    max_covalent_slots: 7,
    valence_requirement: 1,
    electronegativity: 2.96,
    possible_oxidation_states: [1, 5, -1],
    ide_name: 'bromida',
    is_diatomic_element: true,
    group_number: 17
  },
  {
    atomicNumber: 37,
    symbol: 'Rb',
    name: 'Rubidium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [1],
    is_diatomic_element: false,
    group_number: 1
  },
  {
    atomicNumber: 38,
    symbol: 'Sr',
    name: 'Stronsium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2],
    is_diatomic_element: false,
    group_number: 2
  },
  {
    atomicNumber: 39,
    symbol: 'Y',
    name: 'Yttrium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [3],
    is_diatomic_element: false,
    group_number: 3
  },
  {
    atomicNumber: 40,
    symbol: 'Zr',
    name: 'Zirkonium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [4],
    is_diatomic_element: false,
    group_number: 4
  },
  {
    atomicNumber: 41,
    symbol: 'Nb',
    name: 'Niobium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [5, 3],
    is_diatomic_element: false,
    group_number: 5
  },
  {
    atomicNumber: 42,
    symbol: 'Mo',
    name: 'Molibden',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [6, 4],
    is_diatomic_element: false,
    group_number: 6
  },
  {
    atomicNumber: 43,
    symbol: 'Tc',
    name: 'Teknesium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [7, 4],
    is_diatomic_element: false,
    group_number: 7
  },
  {
    atomicNumber: 44,
    symbol: 'Ru',
    name: 'Ruthenium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [3, 4],
    is_diatomic_element: false,
    group_number: 8
  },
  {
    atomicNumber: 45,
    symbol: 'Rh',
    name: 'Rhodium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [3],
    is_diatomic_element: false,
    group_number: 9
  },
  {
    atomicNumber: 46,
    symbol: 'Pd',
    name: 'Paladium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2, 4],
    is_diatomic_element: false,
    group_number: 10
  },
  {
    atomicNumber: 47,
    symbol: 'Ag',
    name: 'Perak',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [1],
    is_diatomic_element: false,
    group_number: 11
  },
  {
    atomicNumber: 48,
    symbol: 'Cd',
    name: 'Kadmium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2],
    is_diatomic_element: false,
    group_number: 12
  },
  {
    atomicNumber: 49,
    symbol: 'In',
    name: 'Indium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [3, 1],
    is_diatomic_element: false,
    group_number: 13
  },
  {
    atomicNumber: 50,
    symbol: 'Sn',
    name: 'Timah',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [4, 2],
    is_diatomic_element: false,
    group_number: 14
  },
  {
    atomicNumber: 51,
    symbol: 'Sb',
    name: 'Antimon',
    supports_covalent: true,
    supports_ionic: false,
    primary_covalent_valency: 3,
    max_covalent_slots: 3,
    valence_requirement: 3,
    electronegativity: 2.05,
    ide_name: 'antimonida',
    is_diatomic_element: false,
    group_number: 15
  },
  {
    atomicNumber: 52,
    symbol: 'Te',
    name: 'Telurium',
    supports_covalent: true,
    supports_ionic: false,
    primary_covalent_valency: 2,
    max_covalent_slots: 2,
    valence_requirement: 2,
    electronegativity: 2.1,
    ide_name: 'telurida',
    is_diatomic_element: false,
    group_number: 16
  },
  {
    atomicNumber: 53,
    symbol: 'I',
    name: 'Yodium',
    supports_covalent: true,
    supports_ionic: true,
    primary_covalent_valency: 1,
    max_covalent_slots: 7,
    electronegativity: 2.66,
    possible_oxidation_states: [1, 5, 7, -1],
    ide_name: 'iodida',
    is_diatomic_element: true,
    group_number: 17
  },
  {
    atomicNumber: 55,
    symbol: 'Cs',
    name: 'Sesium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [1],
    is_diatomic_element: false,
    group_number: 1
  },
  {
    atomicNumber: 56,
    symbol: 'Ba',
    name: 'Barium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2],
    is_diatomic_element: false,
    group_number: 2
  },
  {
    atomicNumber: 72,
    symbol: 'Hf',
    name: 'Hafnium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [4],
    is_diatomic_element: false,
    group_number: 4
  },
  {
    atomicNumber: 73,
    symbol: 'Ta',
    name: 'Tantalum',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [5],
    is_diatomic_element: false,
    group_number: 5
  },
  {
    atomicNumber: 74,
    symbol: 'W',
    name: 'Wolfram',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [6, 4],
    is_diatomic_element: false,
    group_number: 6
  },
  {
    atomicNumber: 75,
    symbol: 'Re',
    name: 'Rhenium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [7, 4, 6],
    is_diatomic_element: false,
    group_number: 7
  },
  {
    atomicNumber: 76,
    symbol: 'Os',
    name: 'Osmium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [4, 8, 3],
    is_diatomic_element: false,
    group_number: 8
  },
  {
    atomicNumber: 77,
    symbol: 'Ir',
    name: 'Iridium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [4, 3, 6],
    is_diatomic_element: false,
    group_number: 9
  },
  {
    atomicNumber: 78,
    symbol: 'Pt',
    name: 'Platina',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [4, 2],
    is_diatomic_element: false,
    group_number: 10
  },
  {
    atomicNumber: 79,
    symbol: 'Au',
    name: 'Emas',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [3, 1],
    is_diatomic_element: false,
    group_number: 11
  },
  {
    atomicNumber: 80,
    symbol: 'Hg',
    name: 'Raksa',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2, 1],
    is_diatomic_element: false,
    group_number: 12
  },
  {
    atomicNumber: 81,
    symbol: 'Tl',
    name: 'Thallium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [3, 1],
    is_diatomic_element: false,
    group_number: 13
  },
  {
    atomicNumber: 82,
    symbol: 'Pb',
    name: 'Timbal',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2, 4],
    is_diatomic_element: false,
    group_number: 14
  },
  {
    atomicNumber: 83,
    symbol: 'Bi',
    name: 'Bismut',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [3, 5],
    is_diatomic_element: false,
    group_number: 15
  },
  {
    atomicNumber: 84,
    symbol: 'Po',
    name: 'Polonium',
    supports_covalent: true,
    supports_ionic: false,
    primary_covalent_valency: 2,
    max_covalent_slots: 2,
    valence_requirement: 2,
    electronegativity: 2.02,
    ide_name: 'polonida',
    is_diatomic_element: false,
    group_number: 16
  },
  {
    atomicNumber: 85,
    symbol: 'At',
    name: 'Astatin',
    supports_covalent: true,
    supports_ionic: false,
    primary_covalent_valency: 1,
    max_covalent_slots: 1,
    valence_requirement: 1,
    electronegativity: 2.2,
    ide_name: 'astatinida',
    is_diatomic_element: false,
    group_number: 17
  },
  {
    atomicNumber: 87,
    symbol: 'Fr',
    name: 'Fransium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [1],
    is_diatomic_element: false,
    group_number: 1
  },
  {
    atomicNumber: 88,
    symbol: 'Ra',
    name: 'Radium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [2],
    is_diatomic_element: false,
    group_number: 2
  },
  {
    atomicNumber: 104,
    symbol: 'Rf',
    name: 'Rutherfordium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [4],
    is_diatomic_element: false,
    group_number: 4
  },
  {
    atomicNumber: 105,
    symbol: 'Db',
    name: 'Dubnium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [5],
    is_diatomic_element: false,
    group_number: 5
  },
  {
    atomicNumber: 106,
    symbol: 'Sg',
    name: 'Seaborgium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [6],
    is_diatomic_element: false,
    group_number: 6
  },
  {
    atomicNumber: 107,
    symbol: 'Bh',
    name: 'Bohrium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [7],
    is_diatomic_element: false,
    group_number: 7
  },
  {
    atomicNumber: 108,
    symbol: 'Hs',
    name: 'Hassium',
    supports_covalent: false,
    supports_ionic: true,
    possible_oxidation_states: [8],
    is_diatomic_element: false,
    group_number: 8
  }
]

export const elementMap: Record<string, string> = elements.reduce(
  (acc, el) => {
    acc[el.symbol] = el.name
    return acc
  },
  {} as Record<string, string>
)

export const getElementIcon = (symbol: string) => {
  return `/src/assets/elements/${symbol.toLowerCase()}.svg`
}
