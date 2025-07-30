import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import pino from 'pino';

import { log } from './logs';

let nodeEnv = vi.hoisted(() => 'development');
const loggerMock = vi.hoisted(() => ({
  info : vi.fn(),
  error : vi.fn(),
}));

vi.mock('$env/static/private', () => ({
  get NODE_ENV() { return nodeEnv; },
}));
vi.mock('pino', () => ({
  default : vi.fn(() => (loggerMock)),
}));

function stubEntry() { return { property : 'value' }; }

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  nodeEnv = 'development';
});
afterAll(() => { vi.restoreAllMocks(); });

describe('log', () => {
  it('logs info messages', () => {
    const entry = stubEntry();
    log(entry, { level : 'info' });
    expect(pino().info).toHaveBeenCalledWith(expect.objectContaining(entry));
  });

  it('logs error messages', () => {
    const entry = stubEntry();
    log(entry, { level : 'error' });
    expect(pino().error).toHaveBeenCalledWith(expect.objectContaining(entry));
  });

  it('logs entry with default type', () => {
    const entry = stubEntry();
    log(entry);
    expect(pino().info).toHaveBeenCalledWith(expect.objectContaining({
      ...entry,
      type : 'app',
    }));
  });

  it('logs entry with specified type', () => {
    const entry = stubEntry();
    log({ ...entry, type : 'test' });
    expect(pino().info).toHaveBeenCalledWith(expect.objectContaining({
      ...entry,
      type : 'test',
    }));
  });

  it('does not format log messages in production', async () => {
    nodeEnv = 'production';
    await import('./logs');

    expect(pino).not.toHaveBeenCalledWith(expect.objectContaining({
      transport : { target : 'pino-pretty' } },
    ));
  });

  it('formats log messages in development', async () => {
    nodeEnv = 'development';
    await import('./logs');

    expect(pino).toHaveBeenCalledWith(expect.objectContaining({
      transport : { target : 'pino-pretty' } },
    ));
  });
});
