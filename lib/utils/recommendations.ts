/**
 * Training Recommendation Engine
 *
 * Simple keyword-matching logic:
 *   - Goal text mentioning "supervisor" or "leadership" → Leadership Academy, Supervisor Training
 *   - Goal text mentioning "bartender" or "cocktails" → Bartender Training
 *   - Skills including "Leadership" → Leadership Academy
 *   - Skills including "Bar Service" or "Cocktail Making" → Bartender Training
 *   - Skills including "Kitchen Skills" or "Kitchen Operations" → General Kitchen Training
 */

export interface TrainingRecommendation {
  title: string
  reason: string
  slug: string
}

const KEYWORD_RULES: { keywords: string[]; title: string; slug: string; reason: string }[] = [
  {
    keywords: ['supervisor', 'leadership', 'lead', 'manage', 'management'],
    title: 'Leadership Academy',
    slug: 'leadership-academy',
    reason: 'Based on your leadership and supervisory goals',
  },
  {
    keywords: ['supervisor', 'supervise'],
    title: 'Supervisor Training',
    slug: 'supervisor-training',
    reason: 'Recommended for aspiring supervisors',
  },
  {
    keywords: ['bartender', 'bartending', 'cocktails', 'cocktail', 'mixology', 'drinks'],
    title: 'Bartender Training',
    slug: 'bartender-training',
    reason: 'Based on your interest in bar and cocktail skills',
  },
  {
    keywords: ['kitchen', 'cooking', 'chef', 'food prep'],
    title: 'General Kitchen Training',
    slug: 'general-kitchen-training',
    reason: 'Based on your kitchen and culinary goals',
  },
  {
    keywords: ['customer service', 'guest experience', 'hospitality', 'service'],
    title: 'Hospitality Foundations',
    slug: 'hospitality-foundations',
    reason: 'Strengthen your guest experience skills',
  },
]

const SKILL_MAP: Record<string, { title: string; slug: string; reason: string }[]> = {
  Leadership: [
    { title: 'Leadership Academy', slug: 'leadership-academy', reason: 'Matches your Leadership skill interest' },
  ],
  'Bar Service': [
    { title: 'Bartender Training', slug: 'bartender-training', reason: 'Matches your Bar Service skill interest' },
  ],
  'Cocktail Making': [
    { title: 'Bartender Training', slug: 'bartender-training', reason: 'Matches your Cocktail Making skill interest' },
  ],
  'Kitchen Skills': [
    { title: 'General Kitchen Training', slug: 'general-kitchen-training', reason: 'Matches your Kitchen Skills interest' },
  ],
  'Kitchen Operations': [
    { title: 'General Kitchen Training', slug: 'general-kitchen-training', reason: 'Matches your Kitchen Operations interest' },
  ],
  'Team Training': [
    { title: 'Leadership Academy', slug: 'leadership-academy', reason: 'Matches your Team Training skill interest' },
  ],
  Bartending: [
    { title: 'Bartender Training', slug: 'bartender-training', reason: 'Matches your Bartending skill interest' },
  ],
  'Customer Service': [
    { title: 'Hospitality Foundations', slug: 'hospitality-foundations', reason: 'Matches your Customer Service interest' },
  ],
}

export function getRecommendations(
  goals: { title: string; description: string | null; category: string }[],
  selectedSkills: string[]
): TrainingRecommendation[] {
  const seen = new Set<string>()
  const recommendations: TrainingRecommendation[] = []

  const addUnique = (rec: TrainingRecommendation) => {
    if (!seen.has(rec.slug)) {
      seen.add(rec.slug)
      recommendations.push(rec)
    }
  }

  // Check goals (career goals weighted higher but check all)
  for (const goal of goals) {
    const text = `${goal.title} ${goal.description ?? ''}`.toLowerCase()
    for (const rule of KEYWORD_RULES) {
      if (rule.keywords.some((kw) => text.includes(kw))) {
        addUnique({ title: rule.title, slug: rule.slug, reason: rule.reason })
      }
    }
  }

  // Check selected skills
  for (const skill of selectedSkills) {
    const mapped = SKILL_MAP[skill]
    if (mapped) {
      for (const rec of mapped) {
        addUnique(rec)
      }
    }
  }

  return recommendations
}
