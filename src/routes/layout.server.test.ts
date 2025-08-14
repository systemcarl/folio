import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { loadGraphics, loadThemes } from '$lib/server/theme';

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
const loadGraphicsMock = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/theme', async original => ({
  ...(await original()),
  loadThemes : loadThemesMock,
  loadGraphics : loadGraphicsMock,
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

  it('loads graphics', async () => {
    const expected = { test : {} };
    const fetch = vi.fn();
    loadThemesMock.mockResolvedValueOnce(expected);
    await load({ ...event, fetch });
    expect(loadGraphics).toHaveBeenCalledWith(expected, { fetch });
  });

  it('returns graphic data', async () => {
    const expected = { test : '<svg></svg>' };
    loadGraphicsMock.mockResolvedValueOnce(expected);
    const result = await load(event) as { graphics : object; };
    expect(result.graphics).toEqual(expected);
  });
});
