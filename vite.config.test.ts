import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  it,
  expect,
  vi,
} from 'vitest';
import * as Sentry from '@sentry/sveltekit';

vi.mock('@sentry/sveltekit', () => ({
  sentrySvelteKit : vi.fn(),
}));

const expectedSentryOrg = 'test-org';
const expectedSentryProject = 'test-project';
const expectedSentryAuthToken = 'test-auth-token';

beforeAll(() => {
  process.env.SENTRY_ORG = expectedSentryOrg;
  process.env.SENTRY_PROJECT = expectedSentryProject;
  process.env.SENTRY_AUTH_TOKEN = expectedSentryAuthToken;
});

beforeEach(() => { vi.clearAllMocks(); });

afterAll(() => { vi.restoreAllMocks(); });

describe('Vite config', () => {
  it('configures Sentry source map plugin', async () => {
    await import('./vite.config.ts');

    expect(Sentry.sentrySvelteKit).toHaveBeenCalledWith({
      sourceMapsUploadOptions : {
        org : expectedSentryOrg,
        project : expectedSentryProject,
        authToken : expectedSentryAuthToken,
      },
    });
  });
});
