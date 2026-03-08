import { attemptBond } from './src/utils/chemistryEngine'

const res1 = attemptBond({ N: 1 }, { H: 1 })
console.log('N + H =', res1.newCompound?.formula, res1.newCompound?.name)

const res2 = attemptBond({ S: 1 }, { H: 1 })
console.log('S + H =', res2.newCompound?.formula, res2.newCompound?.name)

const res3 = attemptBond({ P: 1 }, { Cl: 1 })
console.log('P + Cl =', res3.newCompound?.formula, res3.newCompound?.name)
