import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { loadThemes } from '$lib/server/theme';

import type { LayoutServerLoadEvent } from './$types';
import { load } from './+layout.server';

const event = {
  request : new Request('http://localhost/test', {
    method : 'GET',
    headers : { 'Content-Type' : 'application/json' },
  }),
  url : new URL('http://localhost/'),
  fetch : vi.fn(),
} as unknown as LayoutServerLoadEvent;

const loadThemesMock = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/theme', async original => ({
  ...(await original()),
  loadThemes : loadThemesMock,
}));

beforeEach(() => { vi.clearAllMocks(); });
afterAll(() => { vi.restoreAllMocks(); });

describe('+layout.server.ts', () => {
  it('loads themes', async () => {
    const fetch = vi.fn();
    await load({ ...event, fetch });
    expect(loadThemes).toHaveBeenCalledWith({ fetch });
  });

  it('returns themes data', async () => {
    const expected = { test : {} };
    loadThemesMock.mockResolvedValueOnce(expected);
    const result = await load(event) as { themes : object; };
    expect(result.themes).toEqual(expected);
  });
});
