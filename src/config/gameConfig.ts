// Hitbox sizes (smaller than visual for fair gameplay)
export const HITBOXES = {
  player: { width: 50, height: 60 },
  gift_small: { radius: 20 },
  gift_medium: { radius: 28 },
  gift_large: { radius: 35 },
  tree_small: { width: 40, height: 60 },
  tree_medium: { width: 50, height: 80 },
  tree_large: { width: 70, height: 100 },
  rock: { width: 50, height: 40 },
  snowman: { width: 50, height: 70 },
  booster: { radius: 28 }
} as const;

// Points for gifts
export const GIFT_POINTS = {
  small: 10,
  medium: 30,
  large: 50
} as const;

// Booster configuration
export const BOOSTER_CONFIG = {
  magnet: {
    duration: 5000,
    radius: 180,
    attractSpeed: 0.12,
    maxDuration: 15000
  },
  shield: {
    hits: 3,
    flashDuration: 200
  }
} as const;

// Pool sizes for object pooling
export const POOL_SIZES = {
  gift_small: 30,
  gift_medium: 20,
  gift_large: 10,
  tree_small: 25,
  tree_medium: 15,
  tree_large: 10,
  rock: 15,
  snowman: 10,
  booster_magnet: 3,
  booster_shield: 3
} as const;

// Spawn configuration
export const SPAWN_CONFIG = {
  step: 150,        // Pixels between spawn waves
  laneCount: 5,     // Number of lanes
  spawnBuffer: 100  // Pixels below camera to spawn
} as const;
