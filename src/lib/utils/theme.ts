import { isKey, isObject, tryGet } from './typing';

export interface Section {
  palette : Palette;
  scale : Scale;
  background : Background;
  typography : {
    body : Typography;
    [key : string] : Typography;
  };
  graphics : Record<string, Graphic>;
}

export type Palette = Record<string, string>;

export type Scale = Record<string, string>;

export interface Font {
  family : string;
  fontFace ?: string;
  import ?: string;
}

export interface Background {
  img ?: {
    src : string;
    mode : 'cover' | 'tile';
    opacity ?: number;
    colourMap ?: Record<string, string>;
  };
  fill ?: string;
}

export interface Typography {
  font : string;
  size : string;
  lineHeight ?: string;
  letterSpacing ?: string;
  weight ?: string;
  style ?: string;
  textDecoration ?: string;
  colour ?: string;
  shadowColour ?: string;
}

export interface Graphic {
  src : string;
  alt ?: string;
  colourMap ?: Record<string, string>;
}

export const defaultTheme = {
  sections : {
    default : {
      palette : 'default',
      scale : 'default',
      background : 'default',
      typography : 'default',
      graphics : 'default',
    },
  },
  palettes : {
    default : {
      background : '#FFFFFF',
      textPrimary : '#000000',
    },
  },
  scales : {
    default : {
      fontSize : '1rem',
    },
  },
  fonts : {
    default : { family : 'Arial, sans-serif' },
  },
  backgrounds : {
    default : {
      fill : 'background',
    },
  },
  typography : {
    default : {
      body : {
        font : 'default',
        size : 'fontSize',
        lineHeight : '1.5',
        letterSpacing : 'normal',
        weight : 'normal',
        style : 'normal',
        textDecoration : 'none',
        colour : 'textPrimary',
      },
    },
  },
  graphics : {
    default : {},
  },
} as const;

function copy<T>(value : T) : T {
  return (typeof value === 'object' && value !== null)
    ? JSON.parse(JSON.stringify(value))
    : value;
}

function makeSection(section : unknown, { theme } : {
  theme ?: unknown;
} = {}) : Section {
  let palette = ((section) && (typeof section === 'object')
    && (('palette' in section)
      ? section.palette
      : defaultTheme.sections.default.palette));
  let scale = ((section) && (typeof section === 'object')
    && (('scale' in section)
      ? section.scale
      : defaultTheme.sections.default.scale));
  let background = ((section) && (typeof section === 'object')
    && (('background' in section)
      ? section.background
      : defaultTheme.sections.default.background));
  let typography = ((section) && (typeof section === 'object')
    && (('typography' in section)
      ? section.typography
      : defaultTheme.sections.default.typography));
  let graphics = ((section) && (typeof section === 'object')
    && (('graphics' in section)
      ? section.graphics
      : defaultTheme.sections.default.graphics));

  if (typeof palette === 'string')
    palette = getPalette(theme, { key : palette });
  else palette = getPalette(theme);

  if (typeof scale === 'string')
    scale = getScale(theme, { key : scale });
  else scale = getScale(theme);

  if (typeof background === 'string')
    background = getBackground(theme, {
      key : background,
      palette : palette as Palette,
    });
  else background = getBackground(theme, { palette : palette as Palette });

  const fonts = getFonts(theme);
  if (typeof typography === 'string')
    typography = getTypography(theme, {
      key : typography,
      palette : palette as Palette,
      scale : scale as Scale,
      fonts : fonts as Record<string, Font>,
    });
  else {
    typography = getTypography(theme, {
      palette : palette as Palette,
      scale : scale as Scale,
      fonts : fonts as Record<string, Font>,
    });
  }

  if (typeof graphics === 'string')
    graphics = getGraphics(theme, {
      key : graphics,
      palette : palette as Palette,
    });
  else graphics = getGraphics(theme, { palette : palette as Palette });

  return { palette, scale, background, typography, graphics } as Section;
}

function makePalette(palette : unknown) : Palette {
  const pal = ((typeof palette === 'object' && palette !== null)
    ? copy(palette)
    : {}) as Palette;

  for (const key in pal) {
    if (typeof pal[key] !== 'string') {
      delete pal[key];
    }
  }

  return pal;
}

function makeScale(scale : unknown) : Scale {
  const scl = ((typeof scale === 'object' && scale !== null)
    ? copy(scale)
    : {}) as Scale;

  for (const key in scl) {
    if (typeof scl[key] !== 'string') {
      delete scl[key];
    }
  }
  return scl;
}

function makeFonts(fonts : unknown) : Record<string, Font> {
  const fnt = ((typeof fonts === 'object' && fonts !== null)
    ? copy(fonts)
    : {}) as Record<string, Font>;

  for (const key in fnt) {
    const f = fnt[key];
    if (f === null || typeof f !== 'object' || typeof f.family !== 'string') {
      delete fnt[key];
      continue;
    }

    if (f.fontFace !== undefined && typeof f.fontFace !== 'string') {
      delete f.fontFace;
    }
    if (f.import !== undefined && typeof f.import !== 'string') {
      delete f.import;
    }
  }

  return fnt;
}

function makeBackground(background : unknown, { palette } : {
  palette ?: Palette;
} = {}) : Background {
  const bkg = ((typeof background === 'object' && background !== null)
    ? copy(background)
    : {}) as Background;

  if (('fill' in bkg) && (typeof bkg.fill !== 'string')) {
    delete bkg.fill;
  }

  if (bkg.img !== undefined) {
    if (typeof bkg.img !== 'object' || bkg.img === null) {
      delete bkg.img;
    } else if (typeof bkg.img.src !== 'string') {
      delete bkg.img;
    } else {
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
      if (bkg.img.colourMap[key] === undefined) continue;
      const paletteColour = palette?.[bkg.img.colourMap[key]];
      if (paletteColour) bkg.img.colourMap[key] = paletteColour;
      else delete bkg.img.colourMap[key];
    }
  }

  return bkg;
}

function makeTypography(typography : unknown, { palette, scale, fonts } : {
  palette ?: Palette;
  scale ?: Scale;
  fonts ?: Record<string, Font>;
} = {}) : Record<string, Typography> {
  const typ = ((typeof typography === 'object' && typography !== null)
    ? copy(typography)
    : {}) as Record<string, Typography>;

  for (const key in typ) {
    if (typ[key] === undefined) continue;
    const t = typ[key] = { ...typ[key] };
    if (t === null || typeof t !== 'object' || Array.isArray(t)) {
      delete typ[key];
      continue;
    }
  }

  if (!typ.body) typ.body = copy(defaultTheme.typography.default.body);

  for (const key in typ) {
    if (typ[key] === undefined) continue;
    const t = typ[key] = { ...typ[key] };

    if (typeof t.font !== 'string')
      t.font = defaultTheme.typography.default.body.font;
    if (typeof t.size !== 'string')
      t.size = defaultTheme.typography.default.body.size;
    if ((t.lineHeight !== undefined) && (typeof t.lineHeight !== 'string'))
      delete t.lineHeight;
    if (
      ((t.letterSpacing !== undefined)
        && (typeof t.letterSpacing !== 'string'))
    ) delete t.letterSpacing;
    if ((t.weight !== undefined) && (typeof t.weight !== 'string'))
      delete t.weight;
    if ((t.style !== undefined) && (typeof t.style !== 'string'))
      delete t.style;
    if (
      ((t.textDecoration !== undefined)
        && (typeof t.textDecoration !== 'string'))
    ) delete t.textDecoration;
    if ((t.colour !== undefined) && (typeof t.colour !== 'string'))
      delete t.colour;
    if ((t.shadowColour !== undefined) && (typeof t.shadowColour !== 'string'))
      delete t.shadowColour;

    const fontFamily = fonts?.[t.font]?.family;
    if (fontFamily) t.font = fontFamily;
    else {
      const defaultFontFamily = fonts?.default?.family;
      if (defaultFontFamily) t.font = defaultFontFamily;
      else t.font = defaultTheme.fonts.default.family;
    }

    const fontSize = scale?.[t.size];
    if (fontSize) t.size = fontSize;
    else {
      const defaultFontSize = scale?.fontSize;
      if (defaultFontSize) t.size = defaultFontSize;
      else t.size = defaultTheme.scales.default.fontSize;
    }

    if (t.colour) {
      const paletteColour = palette?.[t.colour];
      if (paletteColour) t.colour = paletteColour;
      else delete t.colour;
    }

    if (t.shadowColour) {
      const paletteColour = palette?.[t.shadowColour];
      if (paletteColour) t.shadowColour = paletteColour;
      else delete t.shadowColour;
    }
  }

  return typ;
}

function makeGraphics(graphics : unknown, { palette } : {
  palette ?: Palette;
} = {}) : Record<string, Graphic> {
  const gfx = ((typeof graphics === 'object' && graphics !== null)
    ? copy(graphics)
    : {}) as Record<string, Graphic>;

  for (const key in gfx) {
    const g = gfx[key];
    if (g === null || typeof g !== 'object' || Array.isArray(g)) {
      delete gfx[key];
      continue;
    }

    if (typeof g.src !== 'string') {
      delete gfx[key];
      continue;
    }

    if (g.alt !== undefined && typeof g.alt !== 'string') {
      delete g.alt;
    }

    if (g.colourMap !== undefined) {
      if (typeof g.colourMap !== 'object')
        delete g.colourMap;
      else if (g.colourMap === null) {
        delete g.colourMap;
      } else {
        for (const key in g.colourMap) {
          if (typeof g.colourMap[key] !== 'string') {
            delete g.colourMap[key];
          }
        }
      }
    }

    if (g.colourMap) {
      for (const key in g.colourMap) {
        if (g.colourMap[key] === undefined) continue;
        const paletteColour = palette?.[g.colourMap[key]];
        if (paletteColour) g.colourMap[key] = paletteColour;
        else delete g.colourMap[key];
      }
    }
  }

  return gfx;
}

function buildPalette(theme : unknown, key ?: string) : object {
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

function buildScale(theme : unknown, key ?: string) : object {
  if (!theme || typeof theme !== 'object') return defaultTheme.scales.default;

  if (key === undefined)
    key = tryGet(theme, '.sections.default.scale', isKey);
  if (key === undefined) key = 'default';
  const scale = tryGet(theme, `.scales.${key}`, isObject);

  const parentScale = (key === 'default')
    ? defaultTheme.scales.default
    : buildScale(theme, 'default');

  return { ...parentScale, ...scale };
}

function buildFonts(theme : unknown) : object {
  if (!theme || typeof theme !== 'object') return defaultTheme.fonts;
  const fonts = tryGet(theme, '.fonts', isObject);
  const parentFonts = defaultTheme.fonts;
  return { ...parentFonts, ...fonts };
}

function buildBackground(theme : unknown, key ?: string) : object {
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

function buildTypography(theme : unknown, key ?: string) : object {
  if (!theme || typeof theme !== 'object')
    return defaultTheme.typography.default;

  if (key === undefined)
    key = tryGet(theme, '.sections.default.typography', isKey);
  if (key === undefined) key = 'default';

  const typography = tryGet(theme, `.typography.${key}`, isObject);

  const parentTypography = (key === 'default')
    ? defaultTheme.typography.default
    : buildTypography(theme, 'default');

  return { ...parentTypography, ...typography };
}

function buildGraphics(theme : unknown, key ?: string) : object {
  if (!theme || typeof theme !== 'object')
    return defaultTheme.graphics.default;

  if (key === undefined)
    key = tryGet(theme, '.sections.default.graphics', isKey);
  if (key === undefined) key = 'default';

  const graphics = tryGet(theme, `.graphics.${key}`, isObject);

  const parentGraphics = (key === 'default')
    ? defaultTheme.graphics.default
    : buildGraphics(theme, 'default');

  return { ...parentGraphics, ...graphics };
}

function buildSection(theme : unknown, key ?: string) : object {
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
  { key } : { key ?: string; } = {},
) : Palette {
  const palette = buildPalette(theme, key);
  return makePalette(palette);
}

function getScale(
  theme : unknown,
  { key } : { key ?: string; } = {},
) : Scale {
  const scale = buildScale(theme, key);
  return makeScale(scale);
}

export function getFonts(
  theme : unknown,
) : Record<string, Font> {
  const fonts = buildFonts(theme);
  return makeFonts(fonts);
}

function getBackground(
  theme : unknown,
  { key, palette } : { key ?: string; palette ?: Palette; } = {},
) : Background {
  const background = buildBackground(theme, key);
  return makeBackground(background, { palette });
}

function getTypography(
  theme : unknown,
  { key, palette, scale, fonts } : {
    key ?: string;
    palette ?: Palette;
    scale ?: Scale;
    fonts ?: Record<string, Font>;
  } = {},
) : Record<string, Typography> {
  const typography = buildTypography(theme, key);
  return makeTypography(typography, { palette, scale : scale, fonts });
}

function getGraphics(
  theme : unknown,
  { key, palette } : { key ?: string; palette ?: Palette; } = {},
) : Record<string, Graphic> {
  const graphics = buildGraphics(theme, key);
  return makeGraphics(graphics, { palette });
}

export function getSection(
  theme : unknown,
  { key } : { key ?: string; } = {},
) : Section {
  const section = buildSection(theme, key);
  return makeSection(section, { theme });
}

export function getAllSections(theme : unknown) : Record<string, Section> {
  const sections = tryGet(theme, '.sections', isObject);
  const sectionKeys = sections ? Object.keys(sections) : ['default'];
  const allSections : Record<string, Section> = {};
  for (const key of sectionKeys) allSections[key] = getSection(theme, { key });
  return allSections;
}
