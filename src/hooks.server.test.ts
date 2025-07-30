import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import * as Sentry from '@sentry/sveltekit';
import { handle, handleError } from './hooks.server';

const sentryHandlerSpy = vi.hoisted(() => vi.fn());

vi.mock('$env/static/public', () => ({
  PUBLIC_SENTRY_DSN : 'test-dsn',
}));
vi.mock('@sentry/sveltekit', () => ({
  init : vi.fn(),
  sentryHandle : vi.fn(() => (args : unknown) => sentryHandlerSpy(args)),
  handleErrorWithSentry : vi.fn(handler => (args : unknown) => {
    sentryHandlerSpy(args);
    return handler(args);
  }),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

afterAll(() => { vi.restoreAllMocks(); });

describe('server hooks', () => {
  it('initializes Sentry error handling', async () => {
    await import('./hooks.server');

    expect(Sentry.init).toHaveBeenCalledWith({
      dsn : 'test-dsn',
      sendDefaultPii : true,
    });
  });
});

describe('request handler', () => {
  it('monitors request with Sentry', async () => {
    const event = {} as RequestEvent;
    const resolve = vi.fn();

    await handle({ event, resolve });

    expect(sentryHandlerSpy).toHaveBeenCalledWith({ event, resolve });
  });
});

describe('error handler', () => {
  it('catches error with Sentry', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');
    const event = {} as RequestEvent;

    handleError({ error, event });

    expect(sentryHandlerSpy).toHaveBeenCalledWith({ error, event });
  });

  it('logs errors', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')
      .mockImplementation(() => {});
    const error = new Error('Test error');
    const event = {} as RequestEvent;

    handleError({ error, event });

    expect(consoleErrorSpy)
      .toHaveBeenCalledWith('Unhandled error (server):', error, event);
    consoleErrorSpy.mockRestore();
  });
});
