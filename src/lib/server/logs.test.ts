import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import pino from 'pino';

import { log } from './logs';

const loggerMock = vi.hoisted(() => ({
  info : vi.fn(),
  error : vi.fn(),
}));

vi.mock('pino', () => ({
  default : vi.fn(() => (loggerMock)),
}));

function stubEntry() { return { property : 'value' }; }

beforeEach(() => { vi.clearAllMocks(); });
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
});
