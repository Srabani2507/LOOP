export const mockStats = {
  totalFeedback: 12543,
  positiveFeedback: 8234,
  negativeFeedback: 2109,
  newThisWeek: 1342,
  aiProcessed: 11892,
  topTheme: 'Performance',
}

export const feedbackTableData = [
  {
    id: '1',
    customer: 'Sarah Johnson',
    channel: 'Email',
    theme: 'Performance',
    sentiment: 'positive',
    message: 'App runs smoothly and fast',
    date: '2024-01-15',
  },
  {
    id: '2',
    customer: 'Mike Chen',
    channel: 'Twitter',
    theme: 'UI/UX',
    sentiment: 'neutral',
    message: 'Dashboard could be more intuitive',
    date: '2024-01-14',
  },
  {
    id: '3',
    customer: 'Emma Davis',
    channel: 'Support',
    theme: 'Features',
    sentiment: 'positive',
    message: 'Love the new export feature!',
    date: '2024-01-13',
  },
  {
    id: '4',
    customer: 'Alex Rodriguez',
    channel: 'Slack',
    theme: 'Performance',
    sentiment: 'negative',
    message: 'Sometimes loads slowly',
    date: '2024-01-12',
  },
  {
    id: '5',
    customer: 'Lisa Anderson',
    channel: 'Email',
    theme: 'Documentation',
    sentiment: 'neutral',
    message: 'Docs need more examples',
    date: '2024-01-11',
  },
]

export const chartData = [
  { month: 'Jan', volume: 2400, positive: 1800, negative: 400, neutral: 200 },
  { month: 'Feb', volume: 2210, positive: 1600, negative: 410, neutral: 200 },
  { month: 'Mar', volume: 2290, positive: 1700, negative: 390, neutral: 200 },
  { month: 'Apr', volume: 2000, positive: 1500, negative: 350, neutral: 150 },
  { month: 'May', volume: 2181, positive: 1650, negative: 380, neutral: 151 },
  { month: 'Jun', volume: 2500, positive: 1900, negative: 400, neutral: 200 },
]

export const sentimentData = [
  { name: 'Positive', value: 65, color: 'var(--chart-2)' },
  { name: 'Neutral', value: 25, color: 'var(--chart-4)' },
  { name: 'Negative', value: 10, color: 'var(--chart-3)' },
]

export const themesData = [
  { theme: 'Performance', count: 3421, trend: 12 },
  { theme: 'UI/UX', count: 2134, trend: -5 },
  { theme: 'Features', count: 1923, trend: 8 },
  { theme: 'Documentation', count: 1543, trend: 3 },
  { theme: 'Support', count: 1342, trend: 15 },
  { theme: 'Pricing', count: 980, trend: -2 },
]

export const reportCards = [
  {
    id: '1',
    dateRange: 'Jan 1 - Jan 31, 2024',
    generatedDate: 'Feb 1, 2024',
    summary: 'January saw a 15% increase in positive feedback with focus on performance improvements.',
  },
  {
    id: '2',
    dateRange: 'Dec 1 - Dec 31, 2023',
    generatedDate: 'Jan 1, 2024',
    summary: 'Strong holiday season with increased feature requests and support inquiries.',
  },
  {
    id: '3',
    dateRange: 'Nov 1 - Nov 30, 2023',
    generatedDate: 'Dec 1, 2023',
    summary: 'Stable month with consistent feedback volume across all channels.',
  },
]

export const teamMembers = [
  { id: '1', name: 'Alex Rivera', role: 'Admin', email: 'alex@company.com' },
  { id: '2', name: 'Jordan Smith', role: 'Editor', email: 'jordan@company.com' },
  { id: '3', name: 'Casey Kim', role: 'Viewer', email: 'casey@company.com' },
  { id: '4', name: 'Morgan Lee', role: 'Viewer', email: 'morgan@company.com' },
]

export const chatHistory = [
  { id: '1', role: 'user', content: 'What are the top customer pain points this week?' },
  {
    id: '2',
    role: 'assistant',
    content:
      'Based on this week&apos;s feedback, the top pain points are: 1) Performance issues during peak hours (mentioned in 23 pieces of feedback), 2) UI navigation complexity (18 mentions), 3) Missing bulk export feature (12 mentions). Performance concerns are trending up 12% compared to last week.',
  },
]

export const suggestedQuestions = [
  'What are customers saying about pricing?',
  'Which features are most requested?',
  'How has sentiment changed this month?',
  'What are the top churn reasons?',
]
