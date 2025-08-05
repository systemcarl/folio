import { tryGet } from '$lib/utils/typing';
import { log } from '$lib/utils/logs';

export interface Section {
  palette : Palette;
  background : Background;
}

export type Palette = Record<string, string>;

export interface Background {
  img? : {
    src : string;
    mode : 'cover' | 'tile';
    opacity? : number;
    colourMap? : Record<string, string>;
  }
  fill? : string;
}

export const defaultTheme = {
  sections : {
    default : {
      palette : 'default',
      background : 'default',
    },
  },
  palettes : {
    default : {
      background : '#FFFFFF',
    },
  },
  backgrounds : {
    default : {
      fill : 'background',
    },
  },
} as const

export async function loadThemes(
  { fetch } : { fetch : typeof window.fetch },
) : Promise<unknown> {
  let themeRequest : Response;
  try {
    themeRequest = await fetch('/theme.json');
  } catch {
    log({ message :'Failed to fetch theme.json' }, { level : 'warn' });
    return { default : defaultTheme };
  }

  if (!themeRequest.ok) {
    log({
      message : 'Failed to fetch theme.json',
      response : {
        status : themeRequest.status,
        body : await themeRequest.text?.().catch(() => null),
      },
    }, { level : 'warn' });
    return { default : defaultTheme };
  }

  try {
    const loadedThemes = await themeRequest.json();
    return loadedThemes;
  } catch {
    log({
      message : 'Failed to parse theme.json',
      response : {
        status : themeRequest.status,
        body : await themeRequest.text?.().catch(() => null),
      },
    }, { level : 'warn' });
    return { default : defaultTheme };
  }
}

function isKey(value : unknown) : value is string {
  return typeof value === 'string';
}

function isObject(value : unknown) : value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function makeSection(section : unknown, { theme } : {
  theme? : unknown;
} = {}) : Section {
  let palette = ((section) && (typeof section === 'object')
    && ('palette' in section))
      ? section.palette
      : defaultTheme.sections.default.palette;
  let background = ((section) && (typeof section === 'object')
    && ('background' in section))
      ? section.background
      : defaultTheme.sections.default.background;

  if (typeof palette === 'string')
    palette = getPalette(theme, { key : palette });
  else palette = getPalette(theme);
  if (typeof background === 'string')
    background = getBackground(theme, {
      key : background,
      palette : palette as Palette
    });
  else background = getBackground(theme, { palette : palette as Palette });

  return { palette, background } as Section;
}

function makePalette(palette : unknown) : Palette {
  const pal = ((typeof palette === 'object' && palette !== null)
    ? { ...palette }
    : {}) as Palette;

  for (const key in pal) {
    if (typeof pal[key] !== 'string') {
      delete pal[key];
    }
  }

  return pal;
}

function makeBackground(background : unknown, { palette } : {
  palette? : Palette;
} = {}) : Background {
  const bkg = ((typeof background === 'object' && background !== null)
    ? { ...background }
    : {}) as Background;

  if (('fill' in bkg) && (typeof bkg.fill !== 'string')) {
    delete bkg.fill;
  }

  if (bkg.img !== undefined) {
    if (typeof bkg.img !== 'object' || bkg.img === null) {
      delete bkg.img;
    } else if (typeof bkg.img.src !== 'string') {
      delete bkg.img;
    } else if (bkg.img !== undefined) {
      if (typeof bkg.img.mode !== 'string') {
        bkg.img.mode = 'cover';
      } else if (!['cover', 'tile'].includes(bkg.img.mode)) {
        bkg.img.mode = 'cover';
      }

      if (bkg.img.opacity !== undefined) {
        if (typeof bkg.img.opacity !== 'number') {
          delete bkg.img.opacity;
        }
      }
      if (bkg.img.colourMap !== undefined) {
        if (typeof bkg.img.colourMap !== 'object')
          bkg.img.colourMap = undefined;
        else if (bkg.img.colourMap === null) {
          bkg.img.colourMap = undefined;
        } else {
          bkg.img.colourMap = { ...bkg.img.colourMap };
          for (const key in bkg.img.colourMap) {
            if (typeof bkg.img.colourMap[key] !== 'string') {
              delete bkg.img.colourMap[key];
            }
          }
        }
      }
    }
  }

  if (bkg.fill) {
    const paletteColour = palette?.[bkg.fill];
    if (paletteColour) bkg.fill = paletteColour;
    else delete bkg.fill;
  }

  if (bkg.img?.colourMap) {
    for (const key in bkg.img.colourMap) {
      const paletteColour = palette?.[bkg.img.colourMap[key]];
      if (paletteColour) bkg.img.colourMap[key] = paletteColour;
      else delete bkg.img.colourMap[key];
    }
  }

  return bkg;
}

function buildPalette(theme : unknown, key? : string) : object {
  if (!theme || typeof theme !== 'object') return defaultTheme.palettes.default;

  if (key === undefined)
    key = tryGet(theme, '.sections.default.palette', isKey);
  if (key === undefined) key = 'default';

  const palette = tryGet(theme, `.palettes.${key}`, isObject);

  const parentPalette = (key === 'default')
    ? defaultTheme.palettes.default
    : buildPalette(theme, 'default');

  return { ...parentPalette, ...palette };
}

function buildBackground(theme : unknown, key? : string) : object {
  if (!theme || typeof theme !== 'object')
    return defaultTheme.backgrounds.default;

  if (key === undefined)
    key = tryGet(theme, '.sections.default.background', isKey);
  if (key === undefined) return buildBackground(theme, 'default');

  const background = tryGet(theme, `.backgrounds.${key}`, isObject);

  const parentBackground = (key === 'default')
    ? defaultTheme.backgrounds.default
    : buildBackground(theme, 'default');

  return { ...parentBackground, ...background };
}

function buildSection(theme : unknown, key? : string) : object {
  if (!theme || typeof theme !== 'object') return defaultTheme.sections.default;

  if (key === undefined) key = 'default';
  const section = tryGet(theme, `.sections.${key}`, isObject);

  const parentSection = (key === 'default')
    ? defaultTheme.sections.default
    : buildSection(theme, 'default');

  return { ...parentSection, ...section };
}

function getPalette(
  theme : unknown,
  { key } : { key? : string } = {},
) : Palette {
  const palette = buildPalette(theme, key);
  return makePalette(palette);
}

function getBackground(
  theme : unknown,
  { key, palette } : { key? : string, palette? : Palette } = {},
) : Background {
  const background = buildBackground(theme, key);
  return makeBackground(background, { palette });
}

export function getSection(
  theme : unknown,
  { key } : { key? : string } = {},
) : Section {
  const section = buildSection(theme, key);
  return makeSection(section, { theme });
}
