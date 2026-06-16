import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { exec } from 'child_process';

// Mock modules before importing diagnostico
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

import { diagnostico } from './diagnostico';

const mockedExec = exec as ReturnType<typeof vi.mocked>;
const mockedExistsSync = existsSync as ReturnType<typeof vi.mocked>;
const mockedReadFileSync = readFileSync as ReturnType<typeof vi.mocked>;

// Collect stdout during diagnostico runs
let stdoutChunks: string[] = [];
let stderrChunks: string[] = [];

beforeEach(() => {
  vi.clearAllMocks();
  stdoutChunks = [];
  stderrChunks = [];
  vi.stubGlobal('process', {
    ...process,
    stdout: new (require('stream').Writable)({
      write(chunk: string) {
        stdoutChunks.push(chunk);
      },
    }) as typeof process.stdout,
    stderr: new (require('stream').Writable)({
      write(chunk: string) {
        stderrChunks.push(chunk);
      },
    }) as typeof process.stderr,
    version: 'v20.0.0',
    cwd: () => '/fake/cwd',
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockExecSuccess(command: string, output: string) {
  mockedExec.mockImplementation((cmd: string, _opts: unknown, cb: (err: null, stdout: string, stderr: string) => void) => {
    if (cmd.startsWith(command)) {
      setImmediate(() => cb(null, output, ''));
    }
    return { on: vi.fn(), stdout: { on: vi.fn() }, stderr: { on: vi.fn() } };
  });
}

function mockExecError(command: string) {
  mockedExec.mockImplementation((cmd: string, _opts: unknown, cb: (err: Error, stdout: string, stderr: string) => void) => {
    if (cmd.startsWith(command)) {
      setImmediate(() => cb(new Error('not found'), '', ''));
    }
    return { on: vi.fn(), stdout: { on: vi.fn() }, stderr: { on: vi.fn() } };
  });
}

describe('diagnostico', () => {
  it('should pass when all checks succeed', async () => {
    // Node check: mocked via process.version
    mockedExec.mockImplementation((cmd: string, _opts: unknown, cb: (err: null, stdout: string, stderr: string) => void) => {
      if (cmd.startsWith('pnpm')) { setImmediate(() => cb(null, '9.0.0\n', '')); return; }
      if (cmd.startsWith('psql')) { setImmediate(() => cb(null, 'psql (PostgreSQL) 16.0\n', '')); return; }
      return { on: vi.fn(), stdout: { on: vi.fn() }, stderr: { on: vi.fn() } };
    });
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

    mockedExec.mockImplementation((cmd: string, _opts: unknown, cb: (err: null, stdout: string, stderr: string) => void) => {
      if (cmd.startsWith('pnpm')) { setImmediate(() => cb(null, '9.0.0\n', '')); return; }
      if (cmd.startsWith('psql')) { setImmediate(() => cb(null, 'psql (PostgreSQL) 16.0\n', '')); return; }
      return { on: vi.fn(), stdout: { on: vi.fn() }, stderr: { on: vi.fn() } };
    });
    mockedExistsSync.mockReturnValue(true);
    mockedReadFileSync.mockReturnValue('DATABASE_URL=postgres://localhost\n');

    await diagnostico();

    const output = stdoutChunks.join('');
    expect(output).toContain('Node.js');
    // The check still runs and will show error for v16
    expect(output).toMatch(/Node\.js.*v16/);

    Object.defineProperty(process, 'version', { value: originalVersion, configurable: true });
  });

  it('should handle missing .env file gracefully', async () => {
    mockedExec.mockImplementation((cmd: string, _opts: unknown, cb: (err: null, stdout: string, stderr: string) => void) => {
      if (cmd.startsWith('pnpm')) { setImmediate(() => cb(null, '9.0.0\n', '')); return; }
      if (cmd.startsWith('psql')) { setImmediate(() => cb(null, 'psql (PostgreSQL) 16.0\n', '')); return; }
      return { on: vi.fn(), stdout: { on: vi.fn() }, stderr: { on: vi.fn() } };
    });
    mockedExistsSync.mockReturnValue(false);
    mockedReadFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    await diagnostico();

    const output = stdoutChunks.join('');
    expect(output).toContain('Arquivo .env');
  });
});
