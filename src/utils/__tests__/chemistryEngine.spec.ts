import { describe, it, expect } from 'vitest'
import { attemptBond, attemptAtomicBond, generateNomenclature } from '../chemistryEngine'

describe('chemistryEngine', () => {
  describe('Covalent Bonding Nomenclature & Logic', () => {
    it('handles simple binary molecules and Greek prefixes', () => {
      const res = attemptBond({ H: 2 }, { O: 1 })
      expect(res.success).toBe(true)
      expect(res.newCompound?.formula).toBe('H₂O')
      expect(res.newCompound?.name).toBe('Dihidrogen Monoksida') // IUPAC proper name

      const res2 = attemptBond({ C: 1, O: 1 }, { O: 1 }) // CO + O -> CO2
      expect(res2.success).toBe(true)
      expect(res2.newCompound?.formula).toBe('CO₂')
      expect(res2.newCompound?.name).toBe('Karbon Dioksida')

      const res3 = attemptBond({ N: 2 }, { O: 1 })
      expect(res3.success).toBe(true)
      expect(res3.newCompound?.formula).toBe('N₂O')
      expect(res3.newCompound?.name).toBe('Dinitrogen Monoksida')

      // Stepwise logic tests (Multivalents)
      // N + O -> NO
      const no = attemptBond({ N: 1 }, { O: 1 })
      expect(no.newCompound?.formula).toBe('NO')

      // NO + O -> NO2
      const no2 = attemptBond({ N: 1, O: 1 }, { O: 1 })
      expect(no2.newCompound?.formula).toBe('NO₂')
      expect(no2.newCompound?.name).toBe('Nitrogen Dioksida')

      // NO2 + O -> NO3
      const no3 = attemptBond({ N: 1, O: 2 }, { O: 1 })
      expect(no3.newCompound?.formula).toBe('NO₃')
      expect(no3.newCompound?.name).toBe('Nitrogen Trioksida')

      // S + O -> SO
      const so = attemptBond({ S: 1 }, { O: 1 })
      expect(so.newCompound?.formula).toBe('SO')

      // SO + O -> SO2
      const so2 = attemptBond({ S: 1, O: 1 }, { O: 1 })
      expect(so2.newCompound?.formula).toBe('SO₂')
      expect(so2.newCompound?.name).toBe('Belerang Dioksida')

      // SO2 + O -> SO3
      const so3 = attemptBond({ S: 1, O: 2 }, { O: 1 })
      expect(so3.newCompound?.formula).toBe('SO₃')
      expect(so3.newCompound?.name).toBe('Belerang Trioksida')
    })

    it('applies IUPAC priority ordering', () => {
      // O and N -> N comes before O
      const res = attemptBond({ N: 1 }, { O: 1 })
      expect(res.success).toBe(true)
      expect(res.newCompound?.formula).toBe('NO') // Stepwise 1:1 bonding for multivalents
      expect(res.newCompound?.name).toBe('Nitrogen Monoksida')

      // S and F -> S comes before F
      const sf6 = generateNomenclature({ S: 1, F: 6 })
      expect(sf6.formula).toBe('SF₆') // Sulfur Hexafluoride -> Belerang Heksafluorida
      expect(sf6.name).toBe('Belerang Heksafluorida')

      // Kr and F (Noble gas + Halogen expanded octet bond)
      const res3 = attemptBond({ Kr: 1 }, { F: 1 }) // Should cross-multiply valency 2 and 1 -> KrF2
      expect(res3.success).toBe(true)
      expect(res3.newCompound?.formula).toBe('KrF₂')
      expect(res3.newCompound?.name).toBe('Kripton Difluorida')
    })

    it('correctly handles vowel elision for oxides', () => {
      // Tetra + Oksida -> Tetroksida
      const n2o4 = generateNomenclature({ N: 2, O: 4 })
      expect(n2o4.formula).toBe('N₂O₄')
      expect(n2o4.name).toBe('Dinitrogen Tetroksida')

      // Penta + Oksida -> Pentoksida
      const p2o5 = generateNomenclature({ P: 2, O: 5 })
      expect(p2o5.formula).toBe('P₂O₅')
      expect(p2o5.name).toBe('Difosfor Pentoksida')
    })
  })

  describe('Ionic Bonding Nomenclature & Logic', () => {
    it('handles fixed charge metals', () => {
      const res = attemptBond({ Na: 1 }, { Cl: 1 })
      expect(res.success).toBe(true)
      expect(res.newCompound?.formula).toBe('NaCl')
      expect(res.newCompound?.name).toBe('Natrium Klorida')

      const res2 = attemptBond({ Mg: 1 }, { Cl: 2 })
      expect(res2.success).toBe(true)
      expect(res2.newCompound?.formula).toBe('MgCl₂')
      expect(res2.newCompound?.name).toBe('Magnesium Klorida')
    })

    it('handles variable charge metals requiring Roman numerals', () => {
      // Fe is variable charge. It defaults to +3 as primary, but +2 is possible.
      // Attempting to bond 1 Fe with 2 Cl should try Fe(II) state.
      // Notice: attemptBond uses components, not predefined compounds, so:
      const res = attemptBond({ Fe: 1 }, { Cl: 3 })
      expect(res.success).toBe(true)
      expect(res.newCompound?.formula).toBe('FeCl₃')
      expect(res.newCompound?.name).toBe('Besi(III) Klorida')
    })

    it('handles complex stoichiometry ionic bonds', () => {
      // Al (3+) + O (2-) -> Al2O3
      const al2o3 = attemptBond({ Al: 1 }, { O: 1 })
      expect(al2o3.success).toBe(true)
      expect(al2o3.newCompound?.formula).toBe('Al₂O₃')
      expect(al2o3.newCompound?.name).toBe('Aluminium Oksida')

      // Sn (4+) + O (2-) -> SnO2 (Sn total valence 4)
      const sno2 = attemptBond({ Sn: 1 }, { O: 1 })
      expect(sno2.success).toBe(true)
      expect(sno2.newCompound?.formula).toBe('SnO₂')
      expect(sno2.newCompound?.name).toBe('Timah(IV) Oksida')
    })
  })

  describe('Atomic Mode & Evolution (Polyatomic Ions)', () => {
    it('evolves sulfite to sulfate', () => {
      // attemptBond is what handles atomic evolution via the intercept block
      const res = attemptBond({ sulfite: 1 }, { O: 1 }, true)
      expect(res.success).toBe(true)
      expect(res.newCompound?.atomicId).toBe('sulfate')
      expect(res.newCompound?.name).toBe('Sulfat')
      expect(res.newCompound?.formula).toBe('SO₄²⁻') // Subscripts from formatFormula
    })

    it('handles element + element resolution in experiment mode', () => {
      // S + O -> sulfite
      const res = attemptBond({ S: 1 }, { O: 1 }, true)
      expect(res.success).toBe(true)
      expect(res.newCompound?.atomicId).toBe('sulfite')
      expect(res.newCompound?.name).toBe('Sulfit')

      // C + O -> carbonate
      const res2 = attemptBond({ C: 1 }, { O: 1 }, true)
      expect(res2.success).toBe(true)
      expect(res2.newCompound?.atomicId).toBe('carbonate')
      expect(res2.newCompound?.name).toBe('Karbonat')
    })

    it('handles atomic ion evolution with elements in experiment mode', () => {
      // carbonate + O -> oxalate
      const res = attemptBond({ carbonate: 1 }, { O: 1 }, true)
      expect(res.success).toBe(true)
      expect(res.newCompound?.atomicId).toBe('oxalate')
      expect(res.newCompound?.name).toBe('Oksalat')
    })

    it('bonds metal with polyatomic ion', () => {
      const res = attemptAtomicBond(null, 'Na', 'sulfate', null)
      expect(res.success).toBe(true)
      expect(res.newCompound?.formula).toBe('Na₂SO₄')
      expect(res.newCompound?.name).toBe('Natrium Sulfat')
    })
  })

  describe('Edge Cases & Failure States', () => {
    it('rejects incompatible bindings like noble gases', () => {
      const res = attemptBond({ Ne: 1 }, { O: 1 })
      expect(res.success).toBe(false)
      expect(res.reason).toBe('incompatible')
    })

    it('rejects over-saturation', () => {
      // Carbon has 4 valence slots. Try adding 5 Hydrogen.
      const res = attemptBond({ C: 1, H: 4 }, { H: 1 })
      expect(res.success).toBe(false)
      expect(res.reason).toBe('capacity_reached')
    })

    it('allows expanded octet scaling up to new max slots', () => {
      // Selenium max slots increased to 6. SeF2 + 1F -> SeF3
      const res1 = attemptBond({ Se: 1, F: 2 }, { F: 1 })
      expect(res1.success).toBe(true)
      expect(res1.newCompound?.formula).toBe('SeF₃')

      // SbF3 + F -> SbF4
      const res3 = attemptBond({ Sb: 1, F: 3 }, { F: 1 })
      expect(res3.success).toBe(true)
      expect(res3.newCompound?.formula).toBe('SbF₄')
    })

    it('handles dimerization and polymerization', () => {
      // NO2 + NO2 -> N2O4
      const n2o4 = attemptBond({ N: 1, O: 2 }, { N: 1, O: 2 })
      expect(n2o4.success).toBe(true)
      expect(n2o4.newCompound?.formula).toBe('N₂O₄')
      expect(n2o4.newCompound?.name).toBe('Dinitrogen Tetroksida')

      // SO3 + SO3 -> S2O6 (simplified logic allows dimerization if total central <= 4)
      const s2o6 = attemptBond({ S: 1, O: 3 }, { S: 1, O: 3 })
      expect(s2o6.success).toBe(true)
      expect(s2o6.newCompound?.formula).toBe('S₂O₆')

      // Reject if over 4 central atoms
      const tooBig = attemptBond({ S: 3, O: 9 }, { S: 2, O: 6 })
      expect(tooBig.success).toBe(false)
      expect(tooBig.reason).toBe('capacity_reached')
    })
  })

  describe('Common Element Pair Validation (Stability Audit)', () => {
    it('produces correct hydrides', () => {
      // CH4
      expect(attemptBond({ C: 1 }, { H: 1 }).newCompound?.formula).toBe('CH₄')
      // NH3
      expect(attemptBond({ N: 1 }, { H: 1 }).newCompound?.formula).toBe('NH₃')
      // PH3
      expect(attemptBond({ P: 1 }, { H: 1 }).newCompound?.formula).toBe('PH₃')
      // H2S
      expect(attemptBond({ S: 1 }, { H: 1 }).newCompound?.formula).toBe('H₂S')
      // AsH3
      expect(attemptBond({ As: 1 }, { H: 1 }).newCompound?.formula).toBe('AsH₃')
      // H2Se
      expect(attemptBond({ Se: 1 }, { H: 1 }).newCompound?.formula).toBe('H₂Se')
      // BH3
      expect(attemptBond({ B: 1 }, { H: 1 }).newCompound?.formula).toBe('BH₃')
      // GeH4
      expect(attemptBond({ Ge: 1 }, { H: 1 }).newCompound?.formula).toBe('GeH₄')
      // SiH4
      expect(attemptBond({ Si: 1 }, { H: 1 }).newCompound?.formula).toBe('SiH₄')
    })

    it('produces correct halides', () => {
      // CCl4
      expect(attemptBond({ C: 1 }, { Cl: 1 }).newCompound?.formula).toBe('CCl₄')
      // NF3
      expect(attemptBond({ N: 1 }, { F: 1 }).newCompound?.formula).toBe('NF₃')
      // PCl3
      expect(attemptBond({ P: 1 }, { Cl: 1 }).newCompound?.formula).toBe('PCl₃')
      // SCl2
      expect(attemptBond({ S: 1 }, { Cl: 1 }).newCompound?.formula).toBe('SCl₂')
      // BF3
      expect(attemptBond({ B: 1 }, { F: 1 }).newCompound?.formula).toBe('BF₃')
      // SiF4
      expect(attemptBond({ Si: 1 }, { F: 1 }).newCompound?.formula).toBe('SiF₄')
      // GeCl4
      expect(attemptBond({ Ge: 1 }, { Cl: 1 }).newCompound?.formula).toBe('GeCl₄')
      // AsF3
      expect(attemptBond({ As: 1 }, { F: 1 }).newCompound?.formula).toBe('AsF₃')
    })

    it('produces correct oxides', () => {
      // CO2
      const co = generateNomenclature({ C: 1, O: 2 })
      expect(co.formula).toBe('CO₂')
      // SO2 (cross-mul S:2, O:2 -> SO)
      // Noting S+O gives SO as it's 2 vs 2, gcd=2, so 1:1=SO not SO2
      const so = attemptBond({ S: 1 }, { O: 1 })
      expect(so.newCompound?.formula).toBe('SO') // per chemistry: SO1 = sulphur monoxide, correct initial bond
      // SiO2
      const sio2 = generateNomenclature({ Si: 1, O: 2 })
      expect(sio2.formula).toBe('SiO₂')
    })
  })

  describe('Chemistry Polish (Final QA)', () => {
    it('formula never contains a raw digit "1"', () => {
      // CO should not render as C1O
      const co = generateNomenclature({ C: 1, O: 1 })
      expect(co.formula).not.toMatch(/\d/)

      // H2O should not render with any raw digits
      const water = attemptBond({ H: 2 }, { O: 1 })
      expect(water.newCompound?.formula).not.toMatch(/[0-9]/)
    })

    it('component keys are sorted deterministically (A onto B == B onto A)', () => {
      // H dragged onto O
      const res1 = attemptBond({ H: 1 }, { O: 1 })
      // O dragged onto H
      const res2 = attemptBond({ O: 1 }, { H: 1 })
      expect(res1.newCompound?.formula).toBe(res2.newCompound?.formula)
      expect(res1.newCompound?.name).toBe(res2.newCompound?.name)
      // Ensure the components keys are in the same order
      const keys1 = Object.keys(res1.newCompound?.components ?? {})
      const keys2 = Object.keys(res2.newCompound?.components ?? {})
      expect(keys1).toEqual(keys2)
    })

    it('Noble Gases (Kr, Xe) bond with Oxygen (strong oxidizer)', () => {
      // Kr + O should succeed — Oxygen is a strong oxidizer
      const krO = attemptBond({ Kr: 1 }, { O: 1 })
      expect(krO.success).toBe(true)

      // Xe + O should succeed
      const xeO = attemptBond({ Xe: 1 }, { O: 1 })
      expect(xeO.success).toBe(true)
    })

    it('Noble Gases (Kr, Xe) reject non-oxidizer partners', () => {
      // Kr + C — Carbon is not a strong oxidizer, should fail
      const krC = attemptBond({ Kr: 1 }, { C: 1 })
      expect(krC.success).toBe(false)

      // Xe + H — Hydrogen is not a strong oxidizer, should fail
      const xeH = attemptBond({ Xe: 1 }, { H: 1 })
      expect(xeH.success).toBe(false)
    })
  })

  describe('Metalloid-Metal Bonding', () => {
    it('allows bonding between metals and metalloids (e.g. Au + Si)', () => {
      // Au (3+) + Si (4-) -> Au4Si3 (Emas(III) Silisida)
      const auSi = attemptBond({ Au: 1 }, { Si: 1 })
      expect(auSi.success).toBe(true)
      expect(auSi.newCompound?.formula).toBe('Au₄Si₃')
      expect(auSi.newCompound?.name).toBe('Emas(III) Silisida')
    })

    it('allows bonding between alkali metals and metalloids (e.g. Na + B)', () => {
      // Na (1+) + B (3-) -> Na3B (Natrium Borida)
      const naB = attemptBond({ Na: 1 }, { B: 1 })
      expect(naB.success).toBe(true)
      expect(naB.newCompound?.formula).toBe('Na₃B')
      expect(naB.newCompound?.name).toBe('Natrium Borida')
    })

    it('retains covalent bonding between metalloids (e.g. B + Si)', () => {
      const bSi = attemptBond({ B: 1 }, { Si: 1 })
      expect(bSi.success).toBe(true)
      expect(bSi.newCompound?.bondType).toBe('covalent')
      expect(bSi.newCompound?.formula).toBe('BSi') // 1:1 initial bond
    })
  })
})
