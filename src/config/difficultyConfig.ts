// Difficulty progression configuration
export const difficulty = {
  // Camera speed
  speed: {
    initial: 300,
    max: 700,
    increment: 0.02  // +0.02 per pixel of distance
  },

  // Obstacles
  obstacles: {
    initialDensity: 0.20,
    maxDensity: 0.45,
    densityIncrement: 0.00003, // +0.03 per 1000px
    maxPerWave: {
      initial: 1,
      max: 3,
      threshold: 5000,   // After 5000px: up to 2
      threshold2: 15000  // After 15000px: up to 3
    }
  },

  // Gifts
  gifts: {
    density: 0.5,
    earlyBonusDistance: 3000,
    earlyBonusMultiplier: 1.5,
    distribution: {
      small: 60,
      medium: 30,
      large: 10
    }
  },

  // Boosters
  boosters: {
    chance: 0.12,
    minDistance: 0,
    cooldown: 900,
    types: ['magnet', 'shield'] as const,
    weights: { magnet: 50, shield: 50 }
  }
};

// Difficulty phases for reference
export const DIFFICULTY_PHASES = [
  { distance: 0,     name: 'Tutorial', speed: 300, density: 0.20 },
  { distance: 2000,  name: 'Easy',     speed: 350, density: 0.28 },
  { distance: 5000,  name: 'Medium',   speed: 450, density: 0.35 },
  { distance: 10000, name: 'Hard',     speed: 550, density: 0.40 },
  { distance: 20000, name: 'Insane',   speed: 650, density: 0.45 },
  { distance: 30000, name: 'Max',      speed: 700, density: 0.45 }
];

// Calculate current difficulty based on distance
export function getDifficulty(distance: number) {
  const d = difficulty;

  // Speed
  const speed = Math.min(
    d.speed.initial + distance * d.speed.increment,
    d.speed.max
  );

  // Obstacle density
  const obstacleDensity = Math.min(
    d.obstacles.initialDensity + distance * d.obstacles.densityIncrement,
    d.obstacles.maxDensity
  );

  // Max obstacles per wave
  let maxObstaclesPerWave = d.obstacles.maxPerWave.initial;
  if (distance > d.obstacles.maxPerWave.threshold2) {
    maxObstaclesPerWave = d.obstacles.maxPerWave.max;
  } else if (distance > d.obstacles.maxPerWave.threshold) {
    maxObstaclesPerWave = 2;
  }

  // Booster chance
  const boosterChance = distance > d.boosters.minDistance
    ? d.boosters.chance
    : 0;

  // Gift density with early game bonus
  let giftDensity = d.gifts.density;
  if (distance < d.gifts.earlyBonusDistance) {
    giftDensity *= d.gifts.earlyBonusMultiplier;
  }

  return {
    speed,
    obstacleDensity,
    maxObstaclesPerWave,
    giftDensity,
    boosterChance
  };
}
