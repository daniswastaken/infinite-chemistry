import { generateNomenclature } from './src/utils/chemistryEngine'

const testCases: { comps: Record<string, number>; expected: string }[] = [
  { comps: { O: 5 }, expected: 'Pentaoksigen' },
  { comps: { O: 1 }, expected: 'Oksigen' },
  { comps: { N: 2, O: 5 }, expected: 'Dinitrogen pentaoksida' },
  { comps: { C: 1, O: 1 }, expected: 'Karbon monoksida' },
  { comps: { O: 4 }, expected: 'Tetraoksigen' }
]

testCases.forEach(({ comps, expected }) => {
  const result = generateNomenclature(comps)
  console.log(`Components: ${JSON.stringify(comps)}`)
  console.log(`Expected: ${expected}`)
  console.log(`Result:   ${result.name}`)
  console.log(result.name === expected ? '✅ PASS' : '❌ FAIL')
  console.log('---')
})
