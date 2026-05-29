export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: Date;
  type?: string;
  scope?: string;
}

export interface ChangelogEntry {
  date: string;
  entries: Commit[];
}

export interface ChangelogOptions {
  /** Repository root path, defaults to process.cwd() */
  cwd?: string;
  /** Commit types to include, defaults to common types */
  types?: string[];
  /** Patterns to skip (in addition to lint/format) */
  skipPatterns?: RegExp[];
  /** Number of days to include, 0 = unlimited */
  days?: number;
  /** Branch to generate from, defaults to main */
  branch?: string;
}

/** Default types to include in changelog */
const DEFAULT_TYPES = ['feat', 'fix', 'perf', 'refactor', 'docs', 'chore', 'test', 'ci'];

/** Patterns for commits to skip */
const DEFAULT_SKIP_PATTERNS = [
  /^chore\(?(.*)\)?: (lint|eslint|prettier|format)/i,
  /^chore: merge/i,
  /^chore\(?(.*)\)?: update lockfile/i,
  /^chore\(?(.*)\)?: bump(ping)?/i,
  /^docs: (changelog|readme)/i,
  /^style: /i,
  /^ci: /i,
];

/**
 * Execute git command and return output
 */
async function execGit(args: string[], cwd: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const execa = require('execa').default;
  const { stdout } = await execa('git', args, { cwd });
  return stdout;
}

/**
 * Parse a commit type and scope from a conventional commit message
 */
function parseCommitType(message: string): { type?: string; scope?: string } {
  const match = message.match(/^(\w+)(?:\(([^)]+)\))?/);
  if (match) {
    return { type: match[1], scope: match[2] };
  }
  return {};
}

/**
 * Check if a commit message should be skipped
 */
function shouldSkip(message: string, options: ChangelogOptions): boolean {
  const skipPatterns = [
    ...DEFAULT_SKIP_PATTERNS,
    ...(options.skipPatterns ?? []),
  ];

  return skipPatterns.some((pattern) => pattern.test(message));
}

/**
 * Parse raw git log output into Commit objects
 */
export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: Date;
}

/**
 * Group commits by date (YYYY-MM-DD)
 */
function groupByDate(commits: Commit[]): ChangelogEntry[] {
  const grouped = new Map<string, Commit[]>();

  for (const commit of commits) {
    const dateKey = commit.date.toISOString().split('T')[0];
    const existing = grouped.get(dateKey) ?? [];
    existing.push(commit);
    grouped.set(dateKey, existing);
  }

  // Convert to sorted array (newest first)
  return Array.from(grouped.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => ({ date, entries }));
}

/**
 * Format a changelog entry for display
 */
export function formatChangelogEntry(entry: ChangelogEntry): string {
  const lines = [`## ${entry.date}`, ''];
  for (const commit of entry.entries) {
    const scope = commit.scope ? `**${commit.scope}**: ` : '';
    lines.push(`- ${scope}${commit.message.replace(/^\w+(?:\([^)]+\))?:\s*/, '')}`);
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * Generate a changelog from git commits
 *
 * @param options - Configuration options for changelog generation
 * @returns Array of changelog entries grouped by date
 *
 * @example
 * const changelog = await generateChangelog();
 * for (const entry of changelog) {
 *   console.log(entry.date);
 *   entry.entries.forEach(e => console.log(`  - ${e.message}`));
 * }
 */
export async function generateChangelog(options: ChangelogOptions = {}): Promise<ChangelogEntry[]> {
  const {
    cwd = process.cwd(),
    days = 0,
    branch = 'main',
    types = DEFAULT_TYPES,
  } = options;

  // Build date filter if days is specified
  const dateFilter = days > 0
    ? `--since="${days} days ago"`
    : '';

  try {
    // Get commits from specified branch
    const output = await execGit(
      [
        'log',
        branch,
        '--format=%H%n%s%n%b',
        '--after="2024-01-01"',
        dateFilter,
      ].filter(Boolean),
      cwd
    );

    // Parse commits from raw output
    const commits: Commit[] = [];
    const blocks = output.split('---END---').filter(Boolean);

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 2) continue;

      const hash = lines[0].trim();
      const message = lines.slice(1).join('\n').trim();

      if (!message || shouldSkip(message, options)) continue;

      const { type, scope } = parseCommitType(message);

      // Filter by type if specified
      if (types && type && !types.includes(type)) continue;

      // Extract date for each commit
      let date: Date;
      try {
        const dateStr = await execGit(['log', '-1', '--format=%aI', hash], cwd);
        date = new Date(dateStr.trim());
      } catch {
        date = new Date();
      }

      commits.push({ hash, message, author: '', date, type, scope });
    }

    return groupByDate(commits);
  } catch (error) {
    // If git fails (e.g., not a git repo), return empty changelog
    console.warn('Failed to generate changelog:', error);
    return [];
  }
}

/**
 * Generate a markdown-formatted changelog string
 */
export async function generateChangelogMarkdown(options: ChangelogOptions = {}): Promise<string> {
  const entries = await generateChangelog(options);

  if (entries.length === 0) {
    return '# Changelog\n\nNo changes found.\n';
  }

  const lines = ['# Changelog', ''];

  for (const entry of entries) {
    lines.push(formatChangelogEntry(entry));
  }

  return lines.join('\n');
}
