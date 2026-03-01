# Chemistry Engine Architecture

This document explains the technical logic behind the bonding system in Infinite Chemistry. The core logic resides in `src/utils/chemistryEngine.ts`.

## Overview

The engine simulates chemical bonding between elements using two main categories: **Ionic** and **Covalent** bonding.

## Ionic Bonding

Ionic bonding occurs between **Metals** and **Non-metals**.

### Logic Flow:

1. **Detection:** Checks if one side is a metal and the other is a non-metal.
2. **Charge Assignment:** Retrieves the `primary_ionic_charge` or `fixed_ionic_charge` for each element.
3. **Cross-over Method:** Uses the standard charge cross-over to determine the empirical formula (e.g., $Na^+$ + $Cl^-$ → $NaCl$, $Mg^{2+}$ + $Cl^-$ → $MgCl_2$).
4. **Simplification:** Applies GCD (Greatest Common Divisor) to ensure the simplest whole-number ratio.

### Nomenclature (Indonesian):

- **Fixed-charge metals:** `[Metal] [Anion]` (e.g., Natrium Klorida).
- **Variable-charge metals:** `[Metal](Roman Numeral) [Anion]` (e.g., Besi(III) Klorida).

## Covalent Bonding

Covalent bonding occurs between **Non-metals**.

### Logic Flow:

1. **Central Atom Selection:** The element with the lowest electronegativity (excluding Hydrogen) is chosen as the central atom.
2. **Slot System:**
   - Each element has `max_covalent_slots` (the maximum bonds it can form).
   - Each bond "occupies" slots based on the `valence_requirement`.
3. **Saturation:** A compound is considered "stable" when its valence requirements are met without exceeding the central atom's capacity.
4. **Polymerization:** Stable molecules can potentially merge into dimers or tetramers (e.g., $AlCl_3$ → $Al_2Cl_6$) if the central atom supports expanded octets (Period 3 and above).

### Nomenclature (Indonesian):

- Follows IUPAC priority: `Xe-Kr-Ar-Ne-He-Al-B-Si-C-Sb-Te-As-P-N-H-S-I-Br-Cl-O-F`.
- Uses Greek prefixes: `Mono-, Di-, Tri-, Tetra-, Penta-`, etc.
- Example: $N_2O$ → **Dinitrogen Monoksida**.

## Helper Utilities

- **`toSubscript(n)`**: Converts numbers to Unicode subscripts ($₂$, $₃$).
- **`applyPrefix(prefix, name)`**: Handles vowel elision (e.g., `Mono-` + `Oksida` → `Monoksida`).
- **`getGreekPrefix(n)`**: Returns the appropriate prefix for a given count.
