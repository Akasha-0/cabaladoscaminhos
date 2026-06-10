import chalk from 'chalk';
export const colors = {
    cyan: chalk.cyan,
    green: chalk.green,
    yellow: chalk.yellow,
    red: chalk.red,
    bold: chalk.bold,
    dim: chalk.dim,
};
export function colorize(text, color) {
    return colors[color](text);
}
//# sourceMappingURL=color.js.map