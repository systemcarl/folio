import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';

import { defaultTheme, loadThemes, loadGraphics } from './theme';

const defaultThemes = { themes : { default : defaultTheme } } as const;

const getAllSectionsMock = vi.hoisted(() => vi.fn());

const fetchResourceMock = vi.hoisted(() => vi.fn());
const FetchJsonResourceMock = vi.hoisted(() => vi.fn());

vi.mock('$lib/utils/theme', () => ({
  getAllSections : getAllSectionsMock,
}));
vi.mock('./http', () => ({
  fetchResource : fetchResourceMock,
  fetchJsonResource : FetchJsonResourceMock,
}));

beforeEach(() => {
  vi.clearAllMocks();
  getAllSectionsMock.mockReturnValue({});
  fetchResourceMock.mockResolvedValue('');
  FetchJsonResourceMock.mockResolvedValue({});
});

afterAll(() => { vi.restoreAllMocks(); });

describe('loadThemes', () => {
  it('fetches theme.json', async () => {
    const fetch = vi.fn();
    await loadThemes({ fetch });
    expect(FetchJsonResourceMock)
      .toHaveBeenCalledWith('/theme.json', { fetch });
  });

  it('returns fetched themes', async () => {
    const themeConfig = { themes : { customTheme : {} } };
    FetchJsonResourceMock.mockResolvedValue(themeConfig);
    const result = await loadThemes({ fetch : vi.fn() });
    expect(result).toEqual(themeConfig?.themes);
  });

  it('returns default theme if fetch fails', async () => {
    FetchJsonResourceMock.mockResolvedValue(null);
    const result = await loadThemes({ fetch : vi.fn() });
    expect(result).toEqual(defaultThemes.themes);
  });
});

describe('loadGraphics', () => {
  it('fetches all background SVGs', async () => {
    const fetch = vi.fn();
    const sections1 = { default : {
      background : { img : { src : '/background1.svg' } },
      graphics : {},
    } };
    const sections2 = {
      default : {
        background : { img : { src : '/background2.svg' } },
        graphics : {},
      },
      section : {
        background : { img : { src : '/background3.svg' } },
        graphics : {},
      },
    };
    const themes = { theme1 : {}, theme2 : {} };
    getAllSectionsMock.mockReturnValueOnce(sections1);
    getAllSectionsMock.mockReturnValueOnce(sections2);
    await loadGraphics(themes, { fetch });
    expect(fetchResourceMock).toHaveBeenCalledTimes(3);
    expect(fetchResourceMock)
      .toHaveBeenCalledWith('/background1.svg', { fetch });
    expect(fetchResourceMock)
      .toHaveBeenCalledWith('/background2.svg', { fetch });
    expect(fetchResourceMock)
      .toHaveBeenCalledWith('/background3.svg', { fetch });
  });

  it('fetches all SVG graphics', async () => {
    const fetch = vi.fn();
    const sections1 = { default : {
      background : {},
      graphics : { default : { src : '/graphic1.svg' } } },
    };
    const sections2 = { default : { background : {}, graphics : {
      default : { src : '/graphic2.svg' },
      graphic : { src : '/graphic3.svg' },
    } } };
    const sections3 = {
      default : { background : {}, graphics : {
        default : { src : '/graphic4.svg' } },
      },
      section : { background : {}, graphics : {
        default : { src : '/graphic5.svg' } },
      },
    };
    const themes = { theme1 : {}, theme2 : {}, theme3 : {} };
    getAllSectionsMock.mockReturnValueOnce(sections1);
    getAllSectionsMock.mockReturnValueOnce(sections2);
    getAllSectionsMock.mockReturnValueOnce(sections3);
    await loadGraphics(themes, { fetch });
    expect(fetchResourceMock).toHaveBeenCalledTimes(5);
    expect(fetchResourceMock).toHaveBeenCalledWith('/graphic1.svg', { fetch });
    expect(fetchResourceMock).toHaveBeenCalledWith('/graphic2.svg', { fetch });
    expect(fetchResourceMock).toHaveBeenCalledWith('/graphic3.svg', { fetch });
    expect(fetchResourceMock).toHaveBeenCalledWith('/graphic4.svg', { fetch });
    expect(fetchResourceMock).toHaveBeenCalledWith('/graphic5.svg', { fetch });
  });

  it('returns SVG graphics as a map', async () => {
    const background = '<background>';
    const graphic = '<graphics>';
    const sections1 = { default : {
      background : { img : { src : '/background.svg' } },
      graphics : {},
    } };
    const sections2 = { default : {
      background : {},
      graphics : { default : { src : '/graphic.svg' } },
    } };
    const themes = { theme1 : {}, theme2 : {} };
    getAllSectionsMock.mockReturnValueOnce(sections1);
    getAllSectionsMock.mockReturnValueOnce(sections2);
    fetchResourceMock.mockResolvedValueOnce(background);
    fetchResourceMock.mockResolvedValueOnce(graphic);
    const graphics = await loadGraphics(themes, { fetch : vi.fn() });
    expect(graphics).toEqual({
      '/background.svg' : background,
      '/graphic.svg' : graphic,
    });
  });

  it('ignores non-SVG graphics', async () => {
    const fetch = vi.fn();
    const sections1 = { default : {
      background : { img : { src : '/background1.svg' } },
      graphics : { default : { src : '/graphic1.png' } },
    } };
    const sections2 = { default : {
      background : { img : { src : '/background2.jpg' } },
      graphics : { default : { src : '/graphic2.svg' } },
    } };
    const themes = { theme1 : {}, theme2 : {} };
    getAllSectionsMock.mockReturnValueOnce(sections1);
    getAllSectionsMock.mockReturnValueOnce(sections2);
    await loadGraphics(themes, { fetch });
    expect(fetchResourceMock).toHaveBeenCalledTimes(2);
    expect(fetchResourceMock)
      .toHaveBeenCalledWith('/background1.svg', { fetch });
    expect(fetchResourceMock).toHaveBeenCalledWith('/graphic2.svg', { fetch });
  });
});
