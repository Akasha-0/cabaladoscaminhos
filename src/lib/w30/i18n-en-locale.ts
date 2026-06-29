// src/lib/w30/i18n-en-locale.ts
// EN locale bundle — mirrors pt-BR strings, focused on core flows
// Kept lightweight: 12 namespaces × ~6 keys each. Full coverage in follow-up.

export const enLocale = {
  common: {
    appName: "Akasha — Cabala dos Caminhos",
    tagline: "Walk your path",
    save: "Save",
    cancel: "Cancel",
    continue: "Continue",
    back: "Back",
    close: "Close",
  },
  auth: {
    login: "Sign in",
    signup: "Create account",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    magicLink: "Send magic link",
  },
  akasha: {
    greeting: "How can Akasha guide you today?",
    thinking: "Reading the signs…",
    errorGeneric: "Something went wrong. Try again in a moment.",
    rateLimitTitle: "Slow down a bit",
    rateLimitBody: "Take a breath, then continue your consultation.",
  },
  reflection: {
    title: "Daily reflection",
    todayPrompt: "Today's question",
    yourAnswer: "Your answer",
    saveEntry: "Save reflection",
    saved: "Reflection saved",
    streakLabel: (n: number) => `${n} day${n === 1 ? "" : "s"} in a row`,
  },
  mesa: {
    title: "Royal Table",
    drawCards: "Draw cards",
    houseNumber: (n: number) => `House ${n}`,
    interpretation: "Interpretation",
    crossReference: "Cross-reference",
  },
  events: {
    upcoming: "Upcoming events",
    joinNow: "Join now",
    register: "Register",
    full: "Full",
    pastEvents: "Past events",
  },
  mentorship: {
    find: "Find a mentor",
    become: "Become a mentor",
    session: "Session",
    scheduled: "Scheduled for {date}",
    requestSent: "Request sent",
  },
  marketplace: {
    title: "Practices marketplace",
    book: "Book",
    priceFrom: (v: number) => `From R$ ${v.toFixed(2)}`,
    cart: "Cart",
    checkout: "Checkout",
  },
  moderation: {
    queue: "Moderation queue",
    approve: "Approve",
    remove: "Remove",
    escalate: "Escalate",
    reason: "Reason",
  },
  community: {
    feed: "Community",
    newPost: "New post",
    comments: "Comments",
    like: "Like",
    share: "Share",
  },
  errors: {
    notFound: "Not found",
    networkError: "Network error. Check your connection.",
    unauthorized: "Please sign in to continue.",
  },
  onboarding: {
    welcome: "Welcome to Akasha",
    step1: "Tell us your name and birth date",
    step2: "Choose your tradition(s)",
    step3: "Set your daily reflection hour",
    finish: "Begin your path",
  },
} as const;

export type EnLocale = typeof enLocale;
