// Email templates
// @ts-nocheck
// eslint-disable

export type TemplateType =
  | 'daily_affirmation'
  | 'moon_phase'
  | 'meditation_reminder'
  | 'ritual_reminder'
  | 'newsletter'
  | 'achievement'
  | 'compatibility'

export interface EmailTemplate {
  id: string
  type: TemplateType
  subject: string
  body: string
  variables: string[]
  category: 'notification' | 'marketing' | 'reminder'
}

const templates: EmailTemplate[] = [
  {
    id: 'daily_affirmation_001',
    type: 'daily_affirmation',
    subject: 'Your Daily Affirmation for {{date}}',
    body: `Dear {{name}},

Your affirmation for today:

"{{content}}"

Take a moment to breathe deeply and let these words sink into your soul.

With love and light,
The Cabala Team`,
    variables: ['name', 'date', 'content'],
    category: 'notification',
  },
  {
    id: 'moon_phase_001',
    type: 'moon_phase',
    subject: 'The Moon Speaks: {{phase}} Phase on {{date}}',
    body: `Dear {{name}},

Tonight's sky holds a {{phase}} moon.

{{description}}

This is an ideal time for: {{ritual_suggestion}}

With celestial blessings,
The Cabala Team`,
    variables: ['name', 'date', 'phase', 'description', 'ritual_suggestion'],
    category: 'notification',
  },
  {
    id: 'meditation_reminder_001',
    type: 'meditation_reminder',
    subject: 'Your Meditation Awaits, {{name}}',
    body: `Dear {{name}},

It's time to center yourself.

Your guided meditation "{{meditation_title}}" is ready for you.

Duration: {{duration}} minutes
Theme: {{theme}}

Take this moment for yourself.

Peace and tranquility,
The Cabala Team`,
    variables: ['name', 'meditation_title', 'duration', 'theme'],
    category: 'reminder',
  },
  {
    id: 'ritual_reminder_001',
    type: 'ritual_reminder',
    subject: 'Upcoming Ritual: {{ritual_name}} on {{date}}',
    body: `Dear {{name}},

A sacred ritual approaches:

{{ritual_name}}
{{date}} at {{time}}

{{description}}

Prepare your space and open your heart.

Blessed be,
The Cabala Team`,
    variables: ['name', 'date', 'time', 'ritual_name', 'description'],
    category: 'reminder',
  },
  {
    id: 'newsletter_001',
    type: 'newsletter',
    subject: 'Monthly Wisdom: {{month}} Edition',
    body: `Dear {{name}},

Welcome to this month's journey of spirit and light.

In This Issue:
{{highlights}}

Featured Article: {{featured_title}}

{{featured_content}}

Until next month, walk your path with courage.

In service,
The Cabala Team`,
    variables: ['name', 'month', 'highlights', 'featured_title', 'featured_content'],
    category: 'marketing',
  },
  {
    id: 'achievement_001',
    type: 'achievement',
    subject: 'Congratulations, {{name}}! New Achievement Unlocked',
    body: `Dear {{name}},

You have reached a new milestone on your spiritual journey!

Achievement: {{achievement_name}}
Description: {{achievement_description}}

You are {{progress}}% closer to enlightenment.

Keep shining your light.

With admiration,
The Cabala Team`,
    variables: ['name', 'achievement_name', 'achievement_description', 'progress'],
    category: 'notification',
  },
  {
    id: 'compatibility_001',
    type: 'compatibility',
    subject: 'Astrological Insights: Your Connection with {{partner_name}}',
    body: `Dear {{name}},

The stars have spoken about your connection with {{partner_name}}.

Compatibility Score: {{score}}/100

Key Insights:
{{insights}}

Strengths of your bond: {{strengths}}
Areas for growth: {{growth_areas}}

May the cosmos guide your journey together.

Stellar blessings,
The Cabala Team`,
    variables: ['name', 'partner_name', 'score', 'insights', 'strengths', 'growth_areas'],
    category: 'notification',
  },
]

export function getTemplates(): EmailTemplate[] {
  return templates
}

export function getTemplateById(id: string): EmailTemplate | undefined {
  return templates.find((t) => t.id === id)
}

export function getTemplatesByType(type: TemplateType): EmailTemplate[] {
  return templates.filter((t) => t.type === type)
}

export function getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
  return templates.filter((t) => t.category === category)
}
