import chalk from 'chalk';

export const colors = {
  cyan: chalk.cyan,
  green: chalk.green,
  yellow: chalk.yellow,
  red: chalk.red,
  bold: chalk.bold,
  dim: chalk.dim,
};

export function colorize(text: string, color: keyof typeof colors): string {
  return colors[color](text);
}
