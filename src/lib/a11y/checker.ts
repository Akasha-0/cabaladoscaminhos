// ============================================================
// ACCESSIBILITY CHECKER - CABALA DOS CAMINHOS
// ============================================================
// Validates elements for accessibility compliance
// ============================================================

export interface A11yIssue {
  type: "contrast" | "aria" | "keyboard" | "semantic" | "focus";
  severity: "error" | "warning";
  element?: string;
  message: string;
  suggestion?: string;
}

export interface A11yCheckOptions {
  minContrastRatio?: number;
  checkFocusOrder?: boolean;
  checkAriaRoles?: boolean;
}

const DEFAULT_OPTIONS: Required<A11yCheckOptions> = {
  minContrastRatio: 4.5,
  checkFocusOrder: true,
  checkAriaRoles: true,
};

// ============================================================
// CONTRAST CHECKING
// ============================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

interface ContrastElement {
  foreground: string;
  background: string;
  element?: string;
}

function checkContrast(element: ContrastElement, minRatio: number): A11yIssue | null {
  const ratio = calculateContrastRatio(element.foreground, element.background);

  if (ratio < minRatio) {
    return {
      type: "contrast",
      severity: ratio < 3 ? "error" : "warning",
      element: element.element,
      message: `Contrast ratio ${ratio.toFixed(2)}:${1} is below minimum ${minRatio}:1`,
      suggestion: `Increase contrast between foreground and background colors. Use a tool like WebAIM Contrast Checker to find compliant color pairs.`,
    };
  }
  return null;
}

// ============================================================
// ARIA CHECKING
// ============================================================

interface AriaElement {
  tag?: string;
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  hasChildren?: boolean;
  isInteractive?: boolean;
  element?: string;
}

const SEMANTIC_INTERACTIVE_ELEMENTS = ["button", "a", "input", "select", "textarea"];

function checkAria(element: AriaElement): A11yIssue[] {
  const issues: A11yIssue[] = [];

  // Interactive elements without accessible name
  if (element.isInteractive) {
    const hasAccessibleName =
      element.ariaLabel ||
      element.role !== undefined;

    if (!hasAccessibleName && element.tag) {
      const isSemanticInteractive = SEMANTIC_INTERACTIVE_ELEMENTS.includes(element.tag);
      if (!isSemanticInteractive) {
        issues.push({
          type: "aria",
          severity: "error",
          element: element.element,
          message: `Interactive element missing accessible name`,
          suggestion: `Add aria-label, aria-labelledby, or ensure the element has text content.`,
        });
      }
    }

    // Role with interactive elements
    if (element.role === "button" || element.role === "link") {
      if (element.tag === "div" || element.tag === "span") {
        issues.push({
          type: "aria",
          severity: "warning",
          element: element.element,
          message: `Element with role="${element.role}" should be a semantic <button> or <a> element`,
          suggestion: `Consider using <button> or <a> elements for better accessibility.`,
        });
      }
    }
  }

  // Elements with role but missing label
  if (element.role && !element.ariaLabel && !element.ariaDescribedBy) {
    if (element.tag && !SEMANTIC_INTERACTIVE_ELEMENTS.includes(element.tag)) {
      issues.push({
        type: "aria",
        severity: "warning",
        element: element.element,
        message: `Element with role="${element.role}" should have aria-label or aria-labelledby`,
        suggestion: `Add aria-label or aria-labelledby to provide an accessible name.`,
      });
    }
  }

  // Empty aria-label
  if (element.ariaLabel !== undefined && element.ariaLabel.trim() === "") {
    issues.push({
      type: "aria",
      severity: "error",
      element: element.element,
      message: `Empty aria-label provides no accessible name`,
      suggestion: `Remove aria-label attribute or provide meaningful text.`,
    });
  }

  // Interactive container with only non-interactive children
  if (
    element.role === "button" &&
    element.hasChildren &&
    element.tag &&
    !SEMANTIC_INTERACTIVE_ELEMENTS.includes(element.tag)
  ) {
    issues.push({
      type: "aria",
      severity: "warning",
      element: element.element,
      message: `Role="button" container contains non-semantic children`,
      suggestion: `Ensure the button role is properly communicated to assistive technologies.`,
    });
  }

  return issues;
}

// ============================================================
// KEYBOARD CHECKING
// ============================================================

interface KeyboardElement {
  tag?: string;
  role?: string;
  tabIndex?: number;
  isInteractive?: boolean;
  hasOnClick?: boolean;
  disabled?: boolean;
  element?: string;
}

const KEYBOARD_TRIGGER_TAGS = ["button", "a", "input", "select", "textarea"];

function checkKeyboard(element: KeyboardElement): A11yIssue[] {
  const issues: A11yIssue[] = [];

  // Non-interactive element with onClick
  if (element.hasOnClick && !element.isInteractive && !element.role) {
    if (element.tag && !KEYBOARD_TRIGGER_TAGS.includes(element.tag)) {
      issues.push({
        type: "keyboard",
        severity: "warning",
        element: element.element,
        message: `Non-interactive element with click handler may not be keyboard accessible`,
        suggestion: `Use a semantic interactive element or add role="button" and tabindex="0".`,
      });
    }
  }

  // Positive tabindex without role
  if (element.tabIndex !== undefined && element.tabIndex > 0 && !element.role) {
    issues.push({
      type: "keyboard",
      severity: "warning",
      element: element.element,
      message: `Positive tabindex should be avoided`,
      suggestion: `Use tabindex="0" or tabindex="-1" instead. Positive tabindex creates confusing focus order.`,
    });
  }

  // Disabled interactive element
  if (element.disabled && element.isInteractive) {
    issues.push({
      type: "keyboard",
      severity: "error",
      element: element.element,
      message: `Disabled interactive element is not focusable via keyboard`,
      suggestion: `If the element should be visible but disabled, ensure screen readers announce the disabled state.`,
    });
  }

  // Interactive element with tabindex -1
  if (element.isInteractive && element.tabIndex === -1) {
    issues.push({
      type: "keyboard",
      severity: "warning",
      element: element.element,
      message: `Interactive element has tabindex="-1", making it unfocusable via keyboard`,
      suggestion: `Remove tabindex="-1" or handle focus programmatically.`,
    });
  }

  return issues;
}

// ============================================================
// MAIN CHECKER
// ============================================================

export interface AccessibilityElement {
  type?: "contrast" | "aria" | "keyboard";
  // Contrast
  foreground?: string;
  background?: string;
  // ARIA
  tag?: string;
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  hasChildren?: boolean;
  // Keyboard
  tabIndex?: number;
  disabled?: boolean;
  hasOnClick?: boolean;
  isInteractive?: boolean;
  element?: string;
}

export function checkAccessibility(
  elements: AccessibilityElement[],
  options: A11yCheckOptions = {}
): A11yIssue[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const issues: A11yIssue[] = [];

  for (const element of elements) {
    // Contrast checks
    if (element.type === "contrast" || (element.foreground && element.background)) {
      const contrastIssue = checkContrast(
        {
          foreground: element.foreground!,
          background: element.background!,
          element: element.element,
        },
        opts.minContrastRatio
      );
      if (contrastIssue) {
        issues.push(contrastIssue);
      }
    }

    // ARIA checks
    if (opts.checkAriaRoles) {
      const isInteractive =
        element.role !== undefined ||
        (element.tag !== undefined && SEMANTIC_INTERACTIVE_ELEMENTS.includes(element.tag));

      const ariaIssues = checkAria({
        tag: element.tag,
        role: element.role,
        ariaLabel: element.ariaLabel,
        ariaDescribedBy: element.ariaDescribedBy,
        hasChildren: element.hasChildren,
        isInteractive: element.isInteractive ?? isInteractive,
        element: element.element,
      });
      issues.push(...ariaIssues);
    }

    // Keyboard checks
    if (opts.checkFocusOrder) {
      const keyboardIssues = checkKeyboard({
        tag: element.tag,
        role: element.role,
        tabIndex: element.tabIndex,
        isInteractive: element.isInteractive ?? element.role !== undefined,
        hasOnClick: element.hasOnClick,
        disabled: element.disabled,
        element: element.element,
      });
      issues.push(...keyboardIssues);
    }
  }

  return issues;
}

// ============================================================
// CONVENIENCE EXPORTS
// ============================================================

export function checkContrastOnly(
  foreground: string,
  background: string,
  element?: string
): A11yIssue | null {
  return checkContrast({ foreground, background, element }, DEFAULT_OPTIONS.minContrastRatio);
}

export function createA11yReport(issues: A11yIssue[]): {
  passed: boolean;
  total: number;
  errors: number;
  warnings: number;
  byType: Record<string, number>;
} {
  return {
    passed: issues.length === 0,
    total: issues.length,
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
    byType: issues.reduce(
      (acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}