import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';

import { log } from './log';

vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => { vi.clearAllMocks(); });
afterAll(() => { vi.restoreAllMocks(); });

describe('log', () => {
  it('logs info message', () => {
    const message = 'Info message';
    log({ message });
    expect(console.log).toHaveBeenCalledWith(message);
  });

  it('logs warning message', () => {
    const message = 'Warning message';
    log({ message }, { level : 'warn' });
    expect(console.warn).toHaveBeenCalledWith(message);
  });

  it('logs error message', () => {
    const message = 'Error message';
    log({ message }, { level : 'error' });
    expect(console.error).toHaveBeenCalledWith(message);
  });

  it('logs additional context', () => {
    const message = 'Info message';
    const context = { key : 'value' };
    log({ message, ...context });
    expect(console.log).toHaveBeenCalledWith(message, context);
  });

  it('logs array message', () => {
    const messages = ['Info message 1', 'Info message 2'];
    log(messages);
    expect(console.log).toHaveBeenCalledWith(...messages);
  });
});
