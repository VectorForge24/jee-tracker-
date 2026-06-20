// XP required for each sub-rank
export const XP_PER_LEVEL = 1500;

// 5 main ranks × 3 sub-ranks = 15 levels
export const RANKS = [
  "Recruit",
  "Cadet",
  "Elite",
  "Commander",
  "Conqueror",
];

/**
 * Returns rank information based on total XP.
 */
export function getRankData(totalXP) {
  const safeXP = Math.max(0, totalXP);

  const levelIndex = Math.floor(safeXP / XP_PER_LEVEL);

  const maxLevel = RANKS.length * 3 - 1;
  const clampedLevel = Math.min(levelIndex, maxLevel);

  const rankIndex = Math.floor(clampedLevel / 3);
  const subRank = 3 - (clampedLevel % 3);

  return {
    rank: RANKS[rankIndex],
    subRank,
    level: clampedLevel,
    progress: safeXP % XP_PER_LEVEL,
    progressMax: XP_PER_LEVEL,
    totalXP: safeXP,
    isMax:
      clampedLevel === maxLevel &&
      safeXP >= XP_PER_LEVEL * (maxLevel + 1),
  };
}
