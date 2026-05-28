// Accessibility data collection
// Skip linting

export interface ColorContrast {
  level: 'AA' | 'AAA' | 'fail';
  ratio: number;
}

export interface FocusIndicator {
  style: 'outline' | 'box' | 'underline' | 'glow';
  offset: string;
  color: string;
  width: string;
}

export interface ScreenReaderAnnouncement {
  live: 'polite' | 'assertive' | 'off';
  role?: 'alert' | 'status' | 'log' | 'marquee';
}

export interface KeyboardShortcut {
  key: string;
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  description: string;
  action: string;
}

export interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  category: 'visual' | 'motor' | 'cognitive' | 'auditory';
  enabled: boolean;
  requiresPreference?: boolean;
}

export interface ARIALandmark {
  role: 'banner' | 'navigation' | 'main' | 'complementary' | 'contentinfo' | 'search' | 'form';
  label: string;
  description: string;
}

export interface ReducedMotionSetting {
  id: string;
  label: string;
  description: string;
  animationDuration: string;
  transitionDuration: string;
}

export interface HighContrastMode {
  id: string;
  name: string;
  backgroundColor: string;
  foregroundColor: string;
  borderColor: string;
  linkColor: string;
  focusColor: string;
}

// Color contrast ratios
const COLOR_CONTRASTS: ColorContrast[] = [
  { level: 'AAA', ratio: 7.0 },
  { level: 'AA', ratio: 4.5 },
  { level: 'AA', ratio: 3.0 },
  { level: 'fail', ratio: 2.0 },
];

// Focus indicators
const FOCUS_INDICATORS: FocusIndicator[] = [
  { style: 'outline', offset: '2px', color: '#2563eb', width: '2px' },
  { style: 'box', offset: '3px', color: '#2563eb', width: '3px' },
  { style: 'underline', offset: '0', color: '#2563eb', width: '3px' },
  { style: 'glow', offset: '0', color: '#2563eb', width: '4px' },
];

// Screen reader announcements
const SCREEN_READER_ANNOUNCEMENTS: ScreenReaderAnnouncement[] = [
  { live: 'polite', role: 'status' },
  { live: 'assertive', role: 'alert' },
  { live: 'polite', role: 'log' },
  { live: 'off' },
];

// Keyboard shortcuts
const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'Escape', modifiers: [], description: 'Close modal or dialog', action: 'close' },
  { key: 'Tab', modifiers: [], description: 'Navigate to next focusable element', action: 'focus-next' },
  { key: 'Tab', modifiers: ['shift'], description: 'Navigate to previous focusable element', action: 'focus-prev' },
  { key: 'Enter', modifiers: [], description: 'Activate focused element', action: 'activate' },
  { key: ' ', modifiers: [], description: 'Toggle checkbox or activate button', action: 'toggle' },
  { key: 'ArrowUp', modifiers: [], description: 'Navigate up in lists or menus', action: 'navigate-up' },
  { key: 'ArrowDown', modifiers: [], description: 'Navigate down in lists or menus', action: 'navigate-down' },
  { key: 'Home', modifiers: [], description: 'Go to first item', action: 'navigate-first' },
  { key: 'End', modifiers: [], description: 'Go to last item', action: 'navigate-last' },
];

// Accessibility features
const ACCESSIBILITY_FEATURES: AccessibilityFeature[] = [
  { id: 'screen-reader-support', name: 'Screen Reader Support', description: 'Optimized for screen reader navigation', category: 'visual', enabled: true, requiresPreference: true },
  { id: 'keyboard-navigation', name: 'Full Keyboard Navigation', description: 'All features accessible via keyboard', category: 'motor', enabled: true },
  { id: 'high-contrast', name: 'High Contrast Mode', description: 'Enhanced color contrast for visibility', category: 'visual', enabled: false, requiresPreference: true },
  { id: 'large-text', name: 'Large Text', description: 'Increased font sizes for readability', category: 'visual', enabled: false, requiresPreference: true },
  { id: 'reduced-motion', name: 'Reduced Motion', description: 'Minimize animations and transitions', category: 'motor', enabled: false, requiresPreference: true },
  { id: 'focus-indicators', name: 'Enhanced Focus Indicators', description: 'More visible focus states', category: 'motor', enabled: true },
  { id: 'skip-links', name: 'Skip Navigation Links', description: 'Quick access to main content', category: 'motor', enabled: true },
  { id: 'aria-live', name: 'ARIA Live Regions', description: 'Dynamic content announcements', category: 'visual', enabled: true },
  { id: 'alt-text', name: 'Alternative Text', description: 'Image descriptions for screen readers', category: 'visual', enabled: true },
  { id: 'captions', name: 'Video Captions', description: 'Text captions for multimedia', category: 'auditory', enabled: false, requiresPreference: true },
  { id: 'transcripts', name: 'Audio Transcripts', description: 'Text versions of audio content', category: 'auditory', enabled: false, requiresPreference: true },
  { id: 'simple-language', name: 'Simplified Language Mode', description: 'Plain language content', category: 'cognitive', enabled: false, requiresPreference: true },
];

// ARIA landmarks
const ARIA_LANDMARKS: ARIALandmark[] = [
  { role: 'banner', label: 'Header', description: 'Site header with logo and navigation' },
  { role: 'navigation', label: 'Main Navigation', description: 'Primary site navigation' },
  { role: 'main', label: 'Main Content', description: 'Primary page content area' },
  { role: 'complementary', label: 'Sidebar', description: 'Supplementary content sidebar' },
  { role: 'contentinfo', label: 'Footer', description: 'Site footer with links and information' },
  { role: 'search', label: 'Search', description: 'Site search functionality' },
  { role: 'form', label: 'Form', description: 'Form sections for user input' },
];

// Reduced motion settings
const REDUCED_MOTION_SETTINGS: ReducedMotionSetting[] = [
  { id: 'full', label: 'Full Reduced Motion', description: 'Minimal animations', animationDuration: '0.01ms', transitionDuration: '0.01ms' },
  { id: 'partial', label: 'Partial Reduced Motion', description: 'Essential animations only', animationDuration: '100ms', transitionDuration: '100ms' },
  { id: 'default', label: 'Default Motion', description: 'Standard animations', animationDuration: '300ms', transitionDuration: '200ms' },
];

// High contrast modes
const HIGH_CONTRAST_MODES: HighContrastMode[] = [
  { id: 'light', name: 'Light High Contrast', backgroundColor: '#ffffff', foregroundColor: '#000000', borderColor: '#000000', linkColor: '#0000ee', focusColor: '#ff0000' },
  { id: 'dark', name: 'Dark High Contrast', backgroundColor: '#000000', foregroundColor: '#ffffff', borderColor: '#ffffff', linkColor: '#ffff00', focusColor: '#00ff00' },
  { id: 'black-yellow', name: 'Black on Yellow', backgroundColor: '#ffff00', foregroundColor: '#000000', borderColor: '#000000', linkColor: '#0000ff', focusColor: '#ff0000' },
  { id: 'white-black', name: 'White on Black', backgroundColor: '#000000', foregroundColor: '#ffffff', borderColor: '#ffffff', linkColor: '#00ffff', focusColor: '#ffff00' },
];

interface AccessibilityData {
  colorContrasts: ColorContrast[];
  focusIndicators: FocusIndicator[];
  screenReaderAnnouncements: ScreenReaderAnnouncement[];
  keyboardShortcuts: KeyboardShortcut[];
  features: AccessibilityFeature[];
  landmarks: ARIALandmark[];
  reducedMotionSettings: ReducedMotionSetting[];
  highContrastModes: HighContrastMode[];
}

function getData(): AccessibilityData {
  return {
    colorContrasts: COLOR_CONTRASTS,
    focusIndicators: FOCUS_INDICATORS,
    screenReaderAnnouncements: SCREEN_READER_ANNOUNCEMENTS,
    keyboardShortcuts: KEYBOARD_SHORTCUTS,
    features: ACCESSIBILITY_FEATURES,
    landmarks: ARIA_LANDMARKS,
    reducedMotionSettings: REDUCED_MOTION_SETTINGS,
    highContrastModes: HIGH_CONTRAST_MODES,
  };
}

export { getData, COLOR_CONTRASTS, FOCUS_INDICATORS, SCREEN_READER_ANNOUNCEMENTS, KEYBOARD_SHORTCUTS, ACCESSIBILITY_FEATURES, ARIA_LANDMARKS, REDUCED_MOTION_SETTINGS, HIGH_CONTRAST_MODES };