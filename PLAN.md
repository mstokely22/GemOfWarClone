# Gems of Combat — Feature Plan

## 1. Remove Accessory Upgrades
- [x] Hide upgrade button/cost for accessories in Forge screen
- [x] Skip accessories in upgrade cost calculations

## 2. Empowered Gems
- [x] Add `empowered` flag to gem data model
- [x] Add configurable spawn chance constant (e.g. `EMPOWERED_SPAWN_CHANCE`)
- [x] Create unique empowered gem SVG art + glow CSS
- [x] On match: empowered gem triggers 3×3 explosion (8 neighbors destroyed & activated)
- [x] Wire explosion into cascade chain (mana grant, skull damage, gravity, recursive matches)
- [x] Gear/passive bonuses can increase empowered spawn rate

## 3. Board-Targeting Spell Infrastructure
- [x] Add `destroyGems(coordSet, isPlayer)` helper in core.js (mana + skulls + remove + gravity + cascade)
- [x] Add targeting mode system: spell sets `state.targeting` with callback
- [x] Consume Row spell — player hovers/taps a row, all 8 gems consumed
- [x] Consume Column spell — same but vertical
- [x] Targeted Explosion — player selects a gem, 3×3 area explodes
- [x] Random Explosion — spell explodes N random gems (no targeting needed)
- [x] Add visual feedback (row/col highlight on hover, gem highlight for explosion)
- [x] Create new weapon entries using these spell types

## 4. Enemy/Ally Targeting for Damage & Heal
- [x] Add targeting mode for selecting an enemy (highlight on hover, tap to choose)
- [x] Add targeting mode for selecting an ally (same UX)
- [x] New spell helpers: `dmgTarget(n)` — player picks enemy, `healTarget(n)` — player picks ally
- [x] Existing auto-target variants: `dmgLast(n)` (last enemy), `dmgRandom(n)` (random)
- [x] Create new weapon entries using targeted damage/heal

## 5. New Priest Weapons (Hybrid Damage + Heal)
- [x] "Smite Staff" — deal damage to front enemy + heal most-wounded ally
- [x] "Judgment Mace" — damage-focused priest mace
- [x] "Radiant Hammer" — AoE damage + group heal (smaller amounts)
- [x] "Staff of Penance" — heal self, damage all enemies for % of heal
- [x] "Mending Staff" — targeted ally heal
- [x] Balance mana costs and scaling with priest passives

## 6. 4+ Match Explosion Passive/Accessory
- [x] New accessory: "Demolition Charm" — on 4+ match, explode 1 random gem (3×3)
- [x] Wire into `processMatches` after extra-turn check
- [x] Empowered spawn rate bonus accessory ("Empowered Lens")

## 7. Treasure Map Purchase in Store
- [x] Add "Buy Treasure Map" option to Store screen (500g)
- [x] Wire purchase button to deduct gold + increment `save.treasureMaps`

---

*Created: March 2026*
