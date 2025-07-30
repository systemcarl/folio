import type { NavigationEvent } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';
import { PUBLIC_SENTRY_DSN } from '$env/static/public';

Sentry.init({
  dsn : PUBLIC_SENTRY_DSN,
  sendDefaultPii : true,
  integrations : [],
});

function errorHandler ({ error, event } : {
  error : unknown;
  event : NavigationEvent;
}) {
  console.error('Unhandled error (client):', error, event);
};

export const handleError = Sentry.handleErrorWithSentry(errorHandler);
