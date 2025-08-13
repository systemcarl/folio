import type { NavigationEvent } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';

import { log } from '$lib/utils/log';
import { PUBLIC_SENTRY_DSN } from '$env/static/public';

Sentry.init({
  dsn : PUBLIC_SENTRY_DSN,
  sendDefaultPii : true,
  integrations : [],
});

function errorHandler({ error, event } : {
  error : unknown;
  event : NavigationEvent;
}) {
  log({
    message : 'Unhandled error',
    error,
    event,
  }, { level : 'error' });
};

export const handleError = Sentry.handleErrorWithSentry(errorHandler);
