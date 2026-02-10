import { SecondMeShade } from '@/types';

export function calculateShadeCompatibility(
  shadesA: SecondMeShade[],
  shadesB: SecondMeShade[]
): { score: number; commonInterests: string[] } {
  if (!shadesA.length || !shadesB.length) {
    return { score: 50, commonInterests: [] };
  }

  const namesA = new Set(shadesA.map(s => s.shadeName.toLowerCase()));
  const namesB = new Set(shadesB.map(s => s.shadeName.toLowerCase()));

  const common: string[] = [];
  for (const name of namesA) {
    if (namesB.has(name)) common.push(name);
  }

  const totalUnique = new Set([...namesA, ...namesB]).size;
  const overlapRatio = common.length / Math.max(totalUnique, 1);

  const score = Math.round(40 + overlapRatio * 50 + Math.random() * 10);
  return {
    score: Math.min(99, Math.max(20, score)),
    commonInterests: common,
  };
}
