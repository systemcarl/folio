import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import * as Sentry from '@sentry/sveltekit';

import { log } from '$lib/server/logs';
import { handleError } from './hooks.server';

const sentryHandlerSpy = vi.hoisted(() => vi.fn());

vi.mock('@sveltejs/kit/hooks', () => {
  return {
    sequence : vi.fn((...handlers : ((args : {
      event : RequestEvent;
      resolve : ((event : RequestEvent) => Promise<Response> | Response);
    }) => Promise<void>)[]) => {
      return async ({ event, resolve } : {
        event : RequestEvent;
        resolve : (event : RequestEvent) => Promise<Response> | Response;
      }) => {
        let response;
        for (const handler of handlers) {
          response = await handler({ event, resolve });
        }
        return response;
      };
    }),
  };
});

vi.mock('$env/static/public', () => ({
  PUBLIC_SENTRY_DSN : 'test-dsn',
}));
vi.mock('@sentry/sveltekit', () => ({
  init : vi.fn(),
  sentryHandle : vi.fn(() => ({ event, resolve } : {
    event : RequestEvent;
    resolve : (event : RequestEvent) => Promise<Response> | Response;
  }) => {
    sentryHandlerSpy({ event, resolve });
    return resolve(event);
  }),
  handleErrorWithSentry : vi.fn(handler => (args : unknown) => {
    sentryHandlerSpy(args);
    return handler(args);
  }),
}));
vi.mock('$lib/server/logs', () => ({
  log : vi.fn(),
}));

function stubError() { return new Error('Test error'); }
function stubEvent() {
  return {
    url : new URL('https://example.com/test'),
    request : { method : 'GET' } as Request,
  } as RequestEvent;
}
function stubResponse() { return new Response('OK', { status : 200 }); }

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
    const event = stubEvent();
    const resolve = vi.fn(() => stubResponse());
    const { handle } = await import('./hooks.server');

    await handle({ event, resolve });

    expect(sentryHandlerSpy)
      .toHaveBeenCalledWith(expect.objectContaining({ event }));
  });

  it('logs request response', async () => {
    const expectedDuration = 500;
    const dateSpy = vi.spyOn(Date, 'now');
    dateSpy.mockReturnValueOnce(1000);
    dateSpy.mockReturnValueOnce(1000 + expectedDuration);
    const event = stubEvent();
    const resolve = vi.fn(() => stubResponse());
    const { handle } = await import('./hooks.server');

    await handle({ event, resolve });

    expect(log).toHaveBeenCalledWith({
      event : {
        message : 'Request response',
        url : event.url.pathname,
        method : event.request.method,
        duration : expectedDuration,
        status : 200,
      },
      type : 'http',
    }, {
      level : 'info',
    });

    dateSpy.mockRestore();
  });

  it('resolves the request', async () => {
    const event = stubEvent();
    const response = stubResponse();
    const resolve = vi.fn(() => response);
    const { handle } = await import('./hooks.server');

    await handle({ event, resolve });

    expect(resolve).toHaveBeenCalled();
    expect(resolve.mock.calls[0]).toEqual([event]);
  });

  it('returns the response', async () => {
    const event = stubEvent();
    const response = stubResponse();
    const resolve = vi.fn(() => response);
    const { handle } = await import('./hooks.server');

    const result = await handle({ event, resolve });

    expect(result).toBe(response);
  });
});

describe('error handler', () => {
  it('catches error with Sentry', () => {
    const error = stubError();
    const event = stubEvent();

    handleError({ error, event });

    expect(sentryHandlerSpy).toHaveBeenCalledWith({ error, event });
  });

  it('ignores client errors', () => {
    const error = stubError();
    const event = stubEvent();
    const status = 404;

    handleError({ error, event, status });

    expect(log).not.toHaveBeenCalled();
  });

  it('logs errors', () => {
    const error = stubError();
    const event = stubEvent();

    handleError({ error, event });

    expect(log).toHaveBeenCalledWith({
      error,
      event : {
        url : event.url.pathname,
        method : event.request.method,
      },
      type : 'unhandled',
    }, {
      level : 'error',
    });
  });
});
