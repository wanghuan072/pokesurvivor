// Mirrors the inspected defaults in moves.js before level/evolution modifiers.
// Read literal data only; never evaluate downloaded game code.
export function moveDefaults(raw) {
  if (!['projectile', 'homing', 'bounce'].includes(raw.kind)) return { ...raw };
  return { ...raw, count: raw.count ?? 1, spread: raw.spread ?? 0.12 };
}
