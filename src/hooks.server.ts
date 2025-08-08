import type { RequestEvent } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';

import { log } from '$lib/utils/logs';
import { PUBLIC_SENTRY_DSN } from '$env/static/public';

Sentry.init({
  dsn: PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
});

async function requestHandler({ event, resolve } : {
  event : RequestEvent,
  resolve : (event : RequestEvent) => Promise<Response> | Response
}) {
  const received = Date.now();
  const response = await resolve(event);

  log({
    event : {
      message : 'Request response',
      url : event.url.pathname,
      method: event.request.method,
      duration : Date.now() - received,
      status : response.status
    },
    type : 'http',
  }, {
    level : 'info'
  });

  return response;
}

function errorHandler({ error, event, status } : {
  error : unknown;
  event : RequestEvent;
  status? : number;
}) {
  if (status && (status >= 400) && (status < 500)) return;
  log({
    error,
    event : {
      url : event.url.pathname,
      method: event.request.method,
    },
    type : 'unhandled',
  }, {
    level : 'error',
  });
};

export const handleError = Sentry.handleErrorWithSentry(errorHandler);

export const handle = sequence(
  Sentry.sentryHandle(),
  requestHandler,
);
