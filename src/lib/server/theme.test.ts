import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';

import { log } from './logs';
import { defaultTheme, loadThemes } from './theme';

let themeConfig : { themes : Record<string, unknown>; };

const defaultThemes = { themes : { default : defaultTheme } } as const;

vi.mock('./logs', () => ({ log : vi.fn() }));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  themeConfig = { themes : {} };
  fetchMock.mockResolvedValue({
    ok : true,
    json : async () => themeConfig,
  });
});

afterAll(() => { vi.restoreAllMocks(); });

describe('loadThemes', () => {
  it('fetches theme.json', async () => {
    await loadThemes({ fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/theme.json');
  });

  it('returns fetched themes', async () => {
    themeConfig = { themes : { customTheme : {} } };
    const result = await loadThemes({ fetch : fetchMock });
    expect(result).toEqual(themeConfig?.themes);
  });

  it('returns default theme if fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));
    const result = await loadThemes({ fetch : fetchMock });
    expect(result).toEqual(defaultThemes.themes);
  });

  it('returns default theme if fetch not ok', async () => {
    fetchMock.mockResolvedValue({ ok : false, json : async () => themeConfig });
    const result = await loadThemes({ fetch : fetchMock });
    expect(result).toEqual(defaultThemes.themes);
  });

  it('returns default theme if JSON parsing fails', async () => {
    fetchMock.mockResolvedValue({
      ok : true,
      json : async () => { throw new Error('Parse error'); },
    });
    const result = await loadThemes({ fetch : fetchMock });
    expect(result).toEqual(defaultThemes.themes);
  });

  it('log warning if fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));
    await loadThemes({ fetch : fetchMock });
    expect(log).toHaveBeenCalledWith({
      message : 'Failed to fetch theme.json',
    }, { level : 'warn' });
  });

  it('log warning if fetch not ok', async () => {
    fetchMock.mockResolvedValue({
      ok : false,
      status : 404,
      text : async () => 'Not Found',
    });
    await loadThemes({ fetch : fetchMock });
    expect(log).toHaveBeenCalledWith({
      message : 'Failed to fetch theme.json',
      response : {
        status : 404,
        body : 'Not Found',
      },
    }, { level : 'warn' });
  });

  it('log warning if JSON parsing fails', async () => {
    fetchMock.mockResolvedValue({
      ok : true,
      status : 200,
      text : async () => 'Invalid JSON',
      json : async () => { throw new Error('Parse error'); },
    });
    await loadThemes({ fetch : fetchMock });
    expect(log).toHaveBeenCalledWith({
      message : 'Failed to parse theme.json',
      response : {
        status : 200,
        body : 'Invalid JSON',
      },
    }, { level : 'warn' });
  });
});
