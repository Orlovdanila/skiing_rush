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
  laneCount: 10,    // Number of lanes (doubled for 2x map width)
  spawnBuffer: 100, // Pixels below camera to spawn
  edgeMargin: 80    // Don't spawn objects too close to map edges
} as const;

// Player physics (angle-based movement with ease-out for arc feel)
export const PLAYER_PHYSICS = {
  maxAngle: Math.PI / 3,        // 60 degrees max turn angle
  angleChangeSpeed: 4.0,        // Base radians/sec (higher = sharper arc start)
  minSpeedFactor: 0.2,          // Min speed at max angle (20% = ease-out effect)
  visualTiltFactor: 0.6,        // Multiplier for sprite rotation
  horizontalSpeedFactor: 1.0    // Multiplier for horizontal speed
} as const;

// Camera configuration
export const CAMERA_CONFIG = {
  initialZoom: 1.0,             // Zoom at game start (no zoom for wider view)
  gameZoom: 1.0,                // Zoom after countdown
  minZoom: 1.0,
  maxZoom: 2.0,
  deadzoneRatio: 0.125,         // 12.5% each side = 25% center deadzone
  lerpX: 0.08,                  // Horizontal camera smoothing
  fieldWidthMultiplier: 2.0     // Map width = screen width * this (2x wider)
} as const;
