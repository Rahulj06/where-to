import type { IVibeScores } from './useRecommendations'

interface IVibeCandidate {
  label: string
  score: number
}

const VIBE_LABELS: Record<keyof IVibeScores, string> = {
  romantic: 'Romantic',
  cozy: 'Cozy',
  loud: 'Lively',
  workFriendly: 'Great for work',
}

export const useVibeDescription = () => {
  const getVibeDescription = (vibeScores: IVibeScores, crowdLevel: number): string => {
    const candidates: Array<IVibeCandidate> = (Object.keys(vibeScores) as Array<keyof IVibeScores>)
      .filter(key => key !== 'loud')
      .map(key => ({ label: VIBE_LABELS[key], score: vibeScores[key] }))

    // Add "lively" if crowd + loud scores are both high
    if (vibeScores.loud >= 7 && crowdLevel >= 7) {
      candidates.push({ label: VIBE_LABELS.loud, score: vibeScores.loud })
    }

    const top = candidates.sort((a, b) => b.score - a.score).slice(0, 2)

    return top.map(c => c.label).join(' · ')
  }

  return { getVibeDescription }
}
