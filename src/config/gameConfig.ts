// Hitbox sizes (smaller than visual for fair gameplay)
export const HITBOXES = {
  player: { width: 36, height: 45 },
  gift_small: { radius: 20 },
  gift_medium: { radius: 28 },
  gift_large: { radius: 35 },
  tree_small: { width: 28, height: 40 },
  tree_medium: { width: 35, height: 55 },
  tree_large: { width: 50, height: 70 },
  rock: { width: 40, height: 30 },
  snowman: { width: 40, height: 50 },
  booster: { radius: 28 }
} as const;

// Points for gifts
export const GIFT_POINTS = {
  small: 10,
  medium: 20,
  large: 30,
  bonus: 40  // Extra large or special
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

// Player physics (angle-based movement)
export const PLAYER_PHYSICS = {
  maxAngle: Math.PI / 4,        // ~45 degrees max turn angle
  angleChangeSpeed: 1.4,        // Radians per second when turning (+15%)
  angleSmoothness: 0.08,        // Lerp factor for smooth interpolation
  visualTiltFactor: 0.6,        // Multiplier for sprite rotation
  horizontalSpeedFactor: 0.9    // Multiplier for horizontal speed (-10%)
} as const;

// Camera configuration
export const CAMERA_CONFIG = {
  initialZoom: 1.5,             // Zoom at game start (closer)
  gameZoom: 1.4,                // Zoom after countdown (50-55% field visible)
  minZoom: 1.0,
  maxZoom: 2.0,
  corridorWidth: 0.25,          // 25% of visible width - player stays centered here
  lerpX: 0.08,                  // Horizontal camera smoothing
  visibleFieldRatio: 0.55       // Target: see 55% of field width
} as const;
