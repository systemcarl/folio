import type { NavigationEvent } from '@sveltejs/kit';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import * as Sentry from '@sentry/sveltekit'
import { handleError } from './hooks.client';

const handlerSpy = vi.hoisted(() => vi.fn());

vi.mock('$env/static/public', () => ({
  PUBLIC_SENTRY_DSN : 'test-dsn',
}));
vi.mock('@sentry/sveltekit', () => ({
  init : vi.fn(),
  handleErrorWithSentry : vi.fn((handler) => (args : unknown) => {
    handlerSpy(args);
    return handler(args);
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('client hooks', () => {
  it('initializes Sentry error handling', async () => {
    await import('./hooks.client');

    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: 'test-dsn',
      sendDefaultPii: true,
      integrations: [],
    });
  });
});

describe('error handler', () => {
  it('catches error with Sentry', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');
    const event = {} as NavigationEvent;

    handleError({ error, event });

    expect(handlerSpy).toHaveBeenCalledWith({ error, event });
  });

  it('logs errors', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')
      .mockImplementation(() => {});
    const error = new Error('Test error');
    const event = {} as NavigationEvent;

    handleError({ error, event });

    expect(consoleErrorSpy)
      .toHaveBeenCalledWith("Unhandled error (client):", error, event);
    consoleErrorSpy.mockRestore();
  });
});
