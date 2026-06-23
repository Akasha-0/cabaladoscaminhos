import { exec } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { diagnostico } from './diagnostico';
// Mock modules before importing diagnostico
vi.mock('fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
}));
vi.mock('child_process', () => ({
    exec: vi.fn(),
}));
const mockedExec = vi.mocked(exec, true);
const mockedExistsSync = vi.mocked(existsSync, true);
const mockedReadFileSync = vi.mocked(readFileSync, true);
// Collect stdout during diagnostico runs
let stdoutChunks = [];
let stderrChunks = [];
beforeEach(() => {
    vi.clearAllMocks();
    stdoutChunks = [];
    stderrChunks = [];
    vi.stubGlobal('process', {
        ...process,
        stdout: new (require('stream').Writable)({
            write(chunk) {
                stdoutChunks.push(chunk);
            },
        }),
        stderr: new (require('stream').Writable)({
            write(chunk) {
                stderrChunks.push(chunk);
            },
        }),
        version: 'v20.0.0',
        cwd: () => '/fake/cwd',
    });
});
afterEach(() => {
    vi.restoreAllMocks();
});
function createExecMock(responses) {
    mockedExec.mockImplementation((cmd, _opts, cb) => {
        const match = responses.find((r) => r.pattern(cmd));
        if (match && cb) {
            setImmediate(() => cb(match.error ?? null, match.stdout, match.stderr ?? ''));
        }
        return {
            on: vi.fn(),
            stdout: { on: vi.fn() },
            stderr: { on: vi.fn() },
        };
    });
}
describe('diagnostico', () => {
    it('should pass when all checks succeed', async () => {
        createExecMock([
            { pattern: (cmd) => cmd.startsWith('pnpm'), stdout: '9.0.0\n' },
            { pattern: (cmd) => cmd.startsWith('psql'), stdout: 'psql (PostgreSQL) 16.0\n' },
        ]);
        mockedExistsSync.mockReturnValue(true);
        mockedReadFileSync.mockReturnValue('DATABASE_URL=postgres://localhost\n');
        await diagnostico();
        const output = stdoutChunks.join('');
        expect(output).toContain('Node.js');
        expect(output).toContain('pnpm');
        expect(output).toContain('PostgreSQL');
        expect(output).toContain('Arquivo .env');
    });
    it('should report Node version below minimum as error', async () => {
        // Override process.version for this test
        const originalVersion = process.version;
        Object.defineProperty(process, 'version', { value: 'v16.0.0', configurable: true });
        createExecMock([
            { pattern: (cmd) => cmd.startsWith('pnpm'), stdout: '9.0.0\n' },
            { pattern: (cmd) => cmd.startsWith('psql'), stdout: 'psql (PostgreSQL) 16.0\n' },
        ]);
        mockedExistsSync.mockReturnValue(true);
        mockedReadFileSync.mockReturnValue('DATABASE_URL=postgres://localhost\n');
        await diagnostico();
        const output = stdoutChunks.join('');
        expect(output).toContain('Node.js');
        expect(output).toContain('v16');
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true });
    });
    it('should handle missing .env file gracefully', async () => {
        createExecMock([
            { pattern: (cmd) => cmd.startsWith('pnpm'), stdout: '9.0.0\n' },
            { pattern: (cmd) => cmd.startsWith('psql'), stdout: 'psql (PostgreSQL) 16.0\n' },
        ]);
        mockedExistsSync.mockReturnValue(false);
        mockedReadFileSync.mockImplementation(() => {
            throw new Error('ENOENT');
        });
        await diagnostico();
        const output = stdoutChunks.join('');
        expect(output).toContain('Arquivo .env');
    });
});
//# sourceMappingURL=diagnostico.test.js.map