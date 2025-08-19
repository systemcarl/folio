import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';

import { loadLocale } from './locale';

const FetchJsonResourceMock = vi.hoisted(() => vi.fn());

vi.mock('./http', () => ({
  fetchJsonResource : FetchJsonResourceMock,
}));

beforeEach(() => {
  vi.clearAllMocks();
  FetchJsonResourceMock.mockResolvedValue({});
});

afterAll(() => { vi.restoreAllMocks(); });

describe('loadLocale', () => {
  it('fetches theme.json', async () => {
    const fetch = vi.fn();
    await loadLocale({ fetch });
    expect(FetchJsonResourceMock)
      .toHaveBeenCalledWith('/locale.json', { fetch });
  });

  it('returns fetched locale', async () => {
    const locale = { key : 'value' };
    FetchJsonResourceMock.mockResolvedValue(locale);
    const result = await loadLocale({ fetch : vi.fn() });
    expect(result).toEqual(locale);
  });

  it('returns empty locale if fetch fails', async () => {
    FetchJsonResourceMock.mockResolvedValue(null);
    const result = await loadLocale({ fetch : vi.fn() });
    expect(result).toEqual({});
  });
});
