/** Mulberry32 — small deterministic PRNG for save/load consistency. */
export function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function randBetween(rng: () => number, min: number, max: number) {
  return min + rng() * (max - min)
}

export function randInt(rng: () => number, min: number, max: number) {
  return Math.floor(randBetween(rng, min, max + 1))
}

export function pickWeighted<T>(rng: () => number, items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0)
  let roll = rng() * total
  for (let i = 0; i < items.length; i += 1) {
    roll -= weights[i]
    if (roll <= 0) return items[i]
  }
  return items[items.length - 1]
}
