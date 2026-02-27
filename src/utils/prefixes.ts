export const greekPrefixes: Record<number, string> = {
  1: 'Mono',
  2: 'Di',
  3: 'Tri',
  4: 'Tetra',
  5: 'Penta',
  6: 'Heksa',
  7: 'Hepta',
  8: 'Okta',
  9: 'Nona',
  10: 'Deka'
}

export const getGreekPrefix = (count: number): string => {
  return greekPrefixes[count] || ''
}
