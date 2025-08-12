import { describe, it, expect } from 'vitest';

import type { Font, Section } from './theme';
import { defaultTheme, getFonts, getSection } from './theme';

const defaultThemes = { default : defaultTheme } as const;

const testTheme = {
  sections : {
    default : {
      palette : 'test',
      scale : 'test',
      background : 'test',
      typography : 'test',
      graphics : 'test',
    },
  },
  palettes : {
    default : { default : '#000', test : '#000000', custom : '#001122' },
    test : { test : '#111111' },
    custom : { custom : '#222222' },
  },
  scales : {
    default : {
      default : 'defaultScale',
      fontSize : 'fontScale',
      test : 'testScale',
      custom : 'customScale',
    },
    test : { test : 'testSize' },
    custom : { custom : 'customSize' },
  },
  fonts : {
    default : { family : 'defaultFont' },
    test : { family : 'testFont' },
    custom : { family : 'customFont' },
  },
  backgrounds : {
    default : { fill : 'default' },
    test : { fill : 'test' },
    custom : { fill : 'custom' },
  },
  typography : {
    default : { body : { font : 'default', size : 'default' } },
    test : { body : { font : 'test', size : 'test' } },
    custom : { body : { font : 'custom', size : 'custom' } },
  },
  graphics : {
    default : { graphic : { src : 'defaultGraphic' } },
    test : { graphic : { src : 'testGraphic' } },
    custom : { graphic : { src : 'customGraphic' } },
  },
} as const;

const testBackgroundImage = {
  src : 'testImage.jpg',
  mode : 'cover' as const,
  opacity : 1,
  colourMap : { first : '#123456', second : '#234567' },
};

const testGraphic = {
  src : 'testGraphic.svg',
  alt : 'Test Graphic',
  colourMap : { first : '#123456', second : '#234567' },
};

function makeSection({
  palette,
  scale,
  fonts,
  background,
  typography,
  graphics,
} : {
  palette ?: Record<string, unknown>;
  scale ?: Record<string, unknown>;
  fonts ?: Record<string, unknown>;
  background ?: object;
  typography ?: Record<string, unknown>;
  graphics ?: Record<string, unknown>;
}) {
  palette = palette ?? {
    ...defaultThemes.default.palettes.default,
    ...testTheme.palettes.default,
    ...testTheme.palettes[testTheme.sections.default.palette],
  };
  scale = scale ?? {
    ...defaultThemes.default.scales.default,
    ...testTheme.scales.default,
    ...testTheme.scales[testTheme.sections.default.scale],
  };
  fonts = fonts ?? {
    ...defaultThemes.default.fonts,
    ...testTheme.fonts,
  };
  background = background ?? {
    ...defaultThemes.default.backgrounds.default,
    ...testTheme.backgrounds.default,
    ...testTheme.backgrounds[testTheme.sections.default.background],
  };
  typography = typography ?? {
    ...defaultThemes.default.typography.default,
    ...testTheme.typography.default,
    ...testTheme.typography[testTheme.sections.default.typography],
  };
  graphics = graphics ?? {
    ...defaultThemes.default.graphics.default,
    ...testTheme.graphics.default,
    ...testTheme.graphics[testTheme.sections.default.graphics],
  };
  return {
    palette : { ...palette },
    scale : { ...scale },
    background : {
      ...background,
      ...(('fill' in background)
        && { fill : palette[background.fill as string] }),
    },
    typography : Object.entries(typography).reduce((acc, [key, value]) => {
      if (!value || typeof value !== 'object') return acc;
      const font = (('font' in value)
        ? fonts[value.font as string]
        : fonts[defaultThemes.default.typography.default.body.font]) as Font;
      return {
        ...(acc as object),
        [key] : {
          ...value,
          font : font?.family ?? defaultThemes.default.fonts.default.family,
          size : (('size' in value)
            ? scale[value.size as string]
            : (scale[defaultThemes.default.typography.default.body.size])
              ?? defaultThemes.default.scales.default.fontSize),
          ...(('colour' in value)
            && { colour : palette[value.colour as string] }),
        },
      };
    }, {} as unknown),
    graphics : { ...graphics },
  } as Section;
}

const defaultSection = makeSection({
  palette : defaultThemes.default.palettes.default,
  scale : defaultThemes.default.scales.default,
  fonts : defaultThemes.default.fonts.default,
  background : defaultThemes.default.backgrounds.default,
  typography : defaultThemes.default.typography.default,
  graphics : defaultThemes.default.graphics.default,
});

const testSection = makeSection({
  palette : testTheme.palettes.test,
  scale : testTheme.scales.test,
  fonts : testTheme.fonts,
  background : testTheme.backgrounds.test,
  typography : testTheme.typography.test,
  graphics : testTheme.graphics.test,
});

describe('getFonts', () => {
  it('returns default theme fonts if no theme provided', () => {
    const fonts = getFonts(undefined);
    expect(fonts).toEqual(defaultThemes.default.fonts);
  });

  it('returns default theme fonts if theme is not an object', () => {
    const fonts = getFonts('not-an-object');
    expect(fonts).toEqual(defaultThemes.default.fonts);
  });

  it('returns default theme fonts if theme has no fonts', () => {
    const theme = { ...testTheme, fonts : undefined };
    const fonts = getFonts(theme);
    expect(fonts).toEqual(defaultThemes.default.fonts);
  });

  it('returns theme fonts if available', () => {
    const theme = testTheme;
    const fonts = getFonts(theme);
    expect(fonts).toEqual(expect.objectContaining(testTheme.fonts));
  });

  it('drops invalid font entries', () => {
    const theme = {
      ...testTheme,
      fonts : {
        ...testTheme.fonts,
        invalid : 'invalid-font',
      },
    };
    const unexpectedFont = { invalid : expect.anything() };
    const fonts = getFonts(theme);
    expect(fonts).toEqual(expect.not.objectContaining(unexpectedFont));
  });

  it('drops fonts with invalid font family', () => {
    const theme = {
      ...testTheme,
      fonts : {
        ...testTheme.fonts,
        invalid : { family : 0 },
      },
    };
    const unexpectedFont = { invalid : expect.anything() };
    const fonts = getFonts(theme);
    expect(fonts).toEqual(expect.not.objectContaining(unexpectedFont));
  });

  it('drops invalid font family font-face url', () => {
    const theme = {
      ...testTheme,
      fonts : {
        ...testTheme.fonts,
        custom : {
          ...testTheme.fonts.custom,
          fontFace : 1,
        },
      },
    };
    const unexpectedFont = { fontFace : expect.anything() };
    const fonts = getFonts(theme);
    expect(fonts.custom).toEqual(expect.not.objectContaining(unexpectedFont));
  });

  it('drops invalid font family import url', () => {
    const theme = {
      ...testTheme,
      fonts : {
        ...testTheme.fonts,
        custom : {
          ...testTheme.fonts.custom,
          import : 1,
        },
      },
    };
    const unexpectedFont = { import : expect.anything() };
    const fonts = getFonts(theme);
    expect(fonts.custom).toEqual(expect.not.objectContaining(unexpectedFont));
  });
});

describe('getSection', () => {
  it('returns default theme section if no theme provided', () => {
    const section = getSection(undefined);
    expect(section).toEqual(defaultSection);
  });

  it('returns default theme section if theme is not an object', () => {
    const section = getSection('not-an-object');
    expect(section).toEqual(defaultSection);
  });

  it('returns default section without key', () => {
    const theme = testTheme;
    const expectedSection = testSection;
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
      scale : expect.objectContaining(expectedSection.scale),
      background : expect.objectContaining(expectedSection.background),
      typography : expect.objectContaining(expectedSection.typography),
    }));
  });

  it('returns section by key', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        custom : {
          ...testTheme.sections.default,
          palette : 'custom',
          scale : 'custom',
          background : 'custom',
          typography : 'custom',
        },
      },
    };
    const expectedSection = makeSection({
      palette : testTheme.palettes.custom,
      scale : testTheme.scales.custom,
      fonts : testTheme.fonts,
      background : testTheme.backgrounds.custom,
      typography : testTheme.typography.custom,
    });
    const section = getSection(theme, { key : 'custom' });
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
      scale : expect.objectContaining(expectedSection.scale),
      background : expect.objectContaining(expectedSection.background),
      typography : expect.objectContaining(expectedSection.typography),
    }));
  });

  it('returns default section if key not found', () => {
    const theme = testTheme;
    const expectedSection = testSection;
    const section = getSection(theme, { key : 'custom' });
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
      scale : expect.objectContaining(expectedSection.scale),
      background : expect.objectContaining(expectedSection.background),
      typography : expect.objectContaining(expectedSection.typography),
    }));
  });

  it('returns default theme section if default not found', () => {
    const { default : _, ...sections } = testTheme.sections;
    const theme = { ...testTheme, sections };
    const palette = defaultThemes.default.sections.default.palette;
    const scale = defaultThemes.default.sections.default.scale;
    const background = defaultThemes.default.sections.default.background;
    const typography = defaultThemes.default.sections.default.typography;
    const expectedSection = makeSection({
      palette : testTheme.palettes[palette],
      scale : testTheme.scales[scale],
      fonts : testTheme.fonts,
      background : testTheme.backgrounds[background],
      typography : testTheme.typography[typography],
    });
    const section = getSection(theme, { key : 'nonexistent' });
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
      scale : expect.objectContaining(expectedSection.scale),
      background : expect.objectContaining(expectedSection.background),
      typography : expect.objectContaining(expectedSection.typography),
    }));
  });

  it('returns section using palette', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, palette : 'custom' },
      },
    };
    const expectedSection = makeSection({
      palette : { ...testTheme.palettes.default, ...testTheme.palettes.custom },
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
    }));
  });

  it('returns section using scale', () => {
    const theme = {
      ...testTheme,
      sections : { default : {
        ...testTheme.sections.default,
        scale : 'custom',
      } },
    };
    const expectedSection = makeSection({
      scale : testTheme.scales.custom,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      scale : expect.objectContaining(expectedSection.scale),
    }));
  });

  it('returns section using background', () => {
    const theme = {
      ...testTheme,
      sections : { default : {
        ...testTheme.sections.default,
        background : 'custom',
      } },
    };
    const expectedSection = makeSection({
      background : testTheme.backgrounds.custom,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      background : expect.objectContaining(expectedSection.background),
    }));
  });

  it('returns section using typography', () => {
    const theme = {
      ...testTheme,
      sections : { default : {
        ...testTheme.sections.default,
        typography : 'custom',
      } },
    };
    const expectedSection = makeSection({
      typography : testTheme.typography.custom,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      typography : expect.objectContaining(expectedSection.typography),
    }));
  });

  it('returns section using graphics', () => {
    const theme = {
      ...testTheme,
      sections : { default : {
        ...testTheme.sections.default,
        graphics : 'custom',
      } },
    };
    const expectedSection = makeSection({
      graphics : testTheme.graphics.custom,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      graphics : expect.objectContaining(expectedSection.graphics),
    }));
  });

  it('returns default palette if palette not set', () => {
    const { palette : _, ...defaultSection } = testTheme.sections.default;
    const theme = {
      ...testTheme,
      sections : { ...testTheme.sections, default : defaultSection },
    };
    const expectedSection = makeSection({
      palette : testTheme.palettes.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
    }));
  });

  it('returns default palette if invalid palette', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, palette : 0 },
      },
    };
    const expectedSection = makeSection({
      palette : testTheme.palettes.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
    }));
  });

  it('returns default palette if palette not found', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, palette : 'alternate' },
      },
    };
    const expectedSection = makeSection({
      palette : testTheme.palettes.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
    }));
  });

  it('returns default theme palette if default not found', () => {
    const theme = {
      ...testTheme,
      palettes : { alternate : { background : '#123456' } },
    };
    const expectedSection = makeSection({
      palette : defaultThemes.default.palettes.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
    }));
  });

  it('returns default theme palette if no palettes', () => {
    const { palettes : _, ...theme } = testTheme;
    const expectedSection = makeSection({
      palette : defaultThemes.default.palettes.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
    }));
  });

  it('returns default scale if scale not set', () => {
    const { scale : _, ...defaultSection } = testTheme.sections.default;
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : defaultSection,
      },
    };
    const expectedSection = makeSection({
      scale : testTheme.scales.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      scale : expect.objectContaining(expectedSection.scale),
    }));
  });

  it('returns default scale if invalid scale', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, scale : 0 },
      },
    };
    const expectedSection = makeSection({
      scale : testTheme.scales.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      scale : expect.objectContaining(expectedSection.scale),
    }));
  });

  it('returns default scale if scale not found', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, scale : 'alternate' },
      },
    };
    const expectedSection = makeSection({
      scale : testTheme.scales.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      scale : expect.objectContaining(expectedSection.scale),
    }));
  });

  it('returns default theme scale if default not found', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, scale : 'custom' },
      },
      scales : { alternate : { fontSize : 'alternate' } },
    };
    const expectedSection = makeSection({
      scale : defaultThemes.default.scales.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      scale : expect.objectContaining(expectedSection.scale),
    }));
  });

  it('returns default theme scale if no scales', () => {
    const { scales : _, ...theme } = testTheme;
    const expectedSection = makeSection({
      scale : defaultThemes.default.scales.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      scale : expect.objectContaining(expectedSection.scale),
    }));
  });

  it('returns default background if background not set', () => {
    const { background : _, ...defaultSection } = testTheme.sections.default;
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : defaultSection,
      },
    };
    const expectedSection = makeSection({
      background : testTheme.backgrounds.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      background : expect.objectContaining(expectedSection.background),
    }));
  });

  it('returns default background if invalid background', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, background : 0 },
      },
    };
    const expectedSection = makeSection({
      background : testTheme.backgrounds.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      background : expect.objectContaining(expectedSection.background),
    }));
  });

  it('returns default background if background not found', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, background : 'alternate' },
      },
    };
    const expectedSection = makeSection({
      background : testTheme.backgrounds.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      background : expect.objectContaining(expectedSection.background),
    }));
  });

  it('returns default theme background if default not found', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, background : 'custom' },
      },
      backgrounds : { alternate : { test : '#111111' } },
    };
    const expectedSection = makeSection({
      background : defaultThemes.default.backgrounds.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      background : expect.objectContaining(expectedSection.background),
    }));
  });

  it('returns default theme background if no backgrounds', () => {
    const { backgrounds : _, ...theme } = testTheme;
    const expectedSection = makeSection({
      background : defaultThemes.default.backgrounds.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      background : expect.objectContaining(expectedSection.background),
    }));
  });

  it('returns default typography if typography not set', () => {
    const { typography : _, ...defaultSection } = testTheme.sections.default;
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : defaultSection,
      },
    };
    const expectedSection = makeSection({
      typography : testTheme.typography.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      typography : expect.objectContaining(expectedSection.typography),
    }));
  });

  it('returns default typography if invalid typography', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, typography : 0 },
      },
    };
    const expectedSection = makeSection({
      typography : testTheme.typography.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      typography : expect.objectContaining(expectedSection.typography),
    }));
  });

  it('returns default typography if typography not found', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, typography : 'alternate' },
      },
    };
    const expectedSection = makeSection({
      typography : testTheme.typography.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      typography : expect.objectContaining(expectedSection.typography),
    }));
  });

  it('returns default theme typography if default not found', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, typography : 'custom' },
      },
      typography : { alternate : { body : { font : 'alternate' } } },
    };
    const expectedSection = makeSection({
      typography : defaultThemes.default.typography.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      typography : expect.objectContaining(expectedSection.typography),
    }));
  });

  it('returns default theme typography if no typography', () => {
    const { typography : _, ...theme } = testTheme;
    const expectedSection = makeSection({
      typography : defaultThemes.default.typography.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      typography : expect.objectContaining(expectedSection.typography),
    }));
  });

  it('returns default graphics if graphics not set', () => {
    const { graphics : _, ...defaultSection } = testTheme.sections.default;
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : defaultSection,
      },
    };
    const expectedSection = makeSection({
      graphics : testTheme.graphics.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      graphics : expect.objectContaining(expectedSection.graphics),
    }));
  });

  it('returns default graphics if invalid graphics', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, graphics : 0 },
      },
    };
    const expectedSection = makeSection({
      graphics : testTheme.graphics.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      graphics : expect.objectContaining(expectedSection.graphics),
    }));
  });

  it('returns default graphics if graphics not found', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, graphics : 'alternate' },
      },
    };
    const expectedSection = makeSection({
      graphics : testTheme.graphics.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      graphics : expect.objectContaining(expectedSection.graphics),
    }));
  });

  it('returns default theme graphics if default not found', () => {
    const theme = {
      ...testTheme,
      sections : {
        ...testTheme.sections,
        default : { ...testTheme.sections.default, graphics : 'custom' },
      },
      graphics : { alternate : { graphic : { src : 'alternateGraphic' } } },
    };
    const expectedSection = makeSection({
      graphics : defaultThemes.default.graphics.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      graphics : expect.objectContaining(expectedSection.graphics),
    }));
  });

  it('returns default theme graphics if no graphics', () => {
    const { graphics : _, ...theme } = testTheme;
    const expectedSection = makeSection({
      graphics : defaultThemes.default.graphics.default,
    });
    const section = getSection(theme);
    expect(section).toEqual(expect.objectContaining({
      graphics : expect.objectContaining(expectedSection.graphics),
    }));
  });

  it('does not mutate theme', () => {
    const expectedTheme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds[testTheme.sections.default.background],
          img : testBackgroundImage,
        },
      },
      graphics : {
        ...testTheme.graphics,
        [testTheme.sections.default.graphics] : {
          ...testTheme.graphics[testTheme.sections.default.graphics],
          graphic : testGraphic,
        },
      },
    };
    const theme = JSON.parse(JSON.stringify(expectedTheme));
    getSection(theme);
    expect(theme).toEqual(expectedTheme);
  });
});

describe('getSection palette', () => {
  it('drops invalid palette entries', () => {
    const theme = {
      ...testTheme,
      palettes : {
        ...testTheme.palettes,
        [testTheme.sections.default.palette] : {
          ...testTheme.palettes.custom,
          valid : '#123456',
          invalid : 0,
        },
      },
    };
    const unexpectedPalette = { invalid : expect.anything() };
    const section = getSection(theme);
    expect(section.palette)
      .toEqual(expect.not.objectContaining(unexpectedPalette));
  });

  it('returns set palette entries', () => {
    const theme = testTheme;
    const expectedPalette =
      testTheme.palettes[testTheme.sections.default.palette];
    const section = getSection(theme);
    expect(section.palette).toEqual(expect.objectContaining(expectedPalette));
  });

  it('returns default palette entries if not defined', () => {
    const theme = {
      ...testTheme,
      palettes : {
        ...testTheme.palettes,
        [testTheme.sections.default.palette] : {},
      },
    };
    const expectedPalette = testTheme.palettes.default;
    const section = getSection(theme);
    expect(section.palette).toEqual(expect.objectContaining(expectedPalette));
  });

  it('returns default theme palette entries if not defined', () => {
    const theme = {
      ...testTheme,
      palettes : {
        ...testTheme.palettes,
        default : {},
        [testTheme.sections.default.palette] : {},
      },
    };
    const expectedPalette = defaultThemes.default.palettes.default;
    const section = getSection(theme);
    expect(section.palette).toEqual(expect.objectContaining(expectedPalette));
  });
});

describe('getSection scale', () => {
  it('drops invalid scale entries', () => {
    const theme = {
      ...testTheme,
      scales : {
        ...testTheme.scales,
        [testTheme.sections.default.scale] : {
          ...testTheme.scales.custom,
          valid : '1rem',
          invalid : 0,
        },
      },
    };
    const unexpectedScale = { invalid : expect.anything() };
    const section = getSection(theme);
    expect(section.scale)
      .toEqual(expect.not.objectContaining(unexpectedScale));
  });

  it('returns set scale entries', () => {
    const theme = testTheme;
    const expectedScale = testTheme.scales[testTheme.sections.default.scale];
    const section = getSection(theme);
    expect(section.scale).toEqual(expect.objectContaining(expectedScale));
  });

  it('returns default scale entries if not defined', () => {
    const theme = {
      ...testTheme,
      scales : {
        ...testTheme.scales,
        [testTheme.sections.default.scale] : {},
      },
    };
    const expectedScale = testTheme.scales.default;
    const section = getSection(theme);
    expect(section.scale).toEqual(expect.objectContaining(expectedScale));
  });

  it('returns default theme scale entries if not defined', () => {
    const theme = {
      ...testTheme,
      scales : {
        ...testTheme.scales,
        default : {},
        [testTheme.sections.default.scale] : {},
      },
    };
    const expectedScale = defaultThemes.default.scales.default;
    const section = getSection(theme);
    expect(section.scale).toEqual(expect.objectContaining(expectedScale));
  });
});

describe('getSection background', () => {
  it('returns set background entries', () => {
    const theme = testTheme;
    const expectedBackground = testSection.background;
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.objectContaining(expectedBackground));
  });

  it('returns default background entries if not defined', () => {
    const { fill : _, ...background } =
      testTheme.backgrounds[testTheme.sections.default.background];
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : { ...background },
      },
    };
    const expectedBackground = makeSection({
      background : testTheme.backgrounds.default,
    }).background;
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.objectContaining(expectedBackground));
  });

  it('returns default theme background entries if not defined', () => {
    const theme = { ...testTheme, backgrounds : {} };
    const expectedBackground = makeSection({
      background : defaultThemes.default.backgrounds.default,
    }).background;
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.objectContaining(expectedBackground));
  });

  it('drops invalid background fill', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          fill : 1,
        },
      },
    };
    const unexpectedBackground = { fill : expect.anything() };
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.not.objectContaining(unexpectedBackground));
  });

  it('returns default palette background fill if fill not found', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          fill : 'custom',
        },
      },
    };
    const expectedBackground = makeSection({
      background : testTheme.backgrounds.custom,
    }).background;
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.objectContaining(expectedBackground));
  });

  it('returns default theme palette background fill if fill not found', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          fill : 'background',
        },
      },
    };
    const expectedBackground = makeSection({
      background : { ...testTheme.backgrounds.custom, fill : 'background' },
    }).background;
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.objectContaining(expectedBackground));
  });

  it('drops background fill if default fill not found', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          fill : 'nonexistent',
        },
      },
    };
    const unexpectedBackground = { fill : expect.anything() };
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.not.objectContaining(unexpectedBackground));
  });

  it('drops background image if invalid', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : 1,
        },
      },
    };
    const unexpectedBackground = { img : expect.anything() };
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.not.objectContaining(unexpectedBackground));
  });

  it('drops background image if source not set', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : {},
        },
      },
    };
    const unexpectedBackground = { img : expect.anything() };
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.not.objectContaining(unexpectedBackground));
  });

  it('drops background image if source invalid', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : { src : 1 },
        },
      },
    };
    const unexpectedBackground = { img : expect.anything() };
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.not.objectContaining(unexpectedBackground));
  });

  it('defaults to cover mode if mode not set', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : { src : 'image.jpg' },
        },
      },
    };
    const expectedBackground = { img : { src : 'image.jpg', mode : 'cover' } };
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.objectContaining(expectedBackground));
  });

  it('defaults mode to cover if mode invalid', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : { src : 'image.jpg', mode : 1 },
        },
      },
    };
    const expectedBackground = { img : { src : 'image.jpg', mode : 'cover' } };
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.objectContaining(expectedBackground));
  });

  it('defaults mode to cover if mode not valid option', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : { src : 'image.jpg', mode : 'bad' },
        },
      },
    };
    const expectedBackground = { img : { src : 'image.jpg', mode : 'cover' } };
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.objectContaining(expectedBackground));
  });

  it.each([
    { mode : 'cover' },
    { mode : 'tile' },
  ])('returns %s background image mode', ({ mode }) => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : { src : 'image.jpg', mode },
        },
      },
    };
    const expectedBackground = { img : { src : 'image.jpg', mode } };
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.objectContaining(expectedBackground));
  });

  it('drops invalid image opacity', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : { src : 'image.jpg', opacity : '?' },
        },
      },
    };
    const expectedImg = { src : 'image.jpg', mode : 'cover' };
    const unexpectedImg = { opacity : expect.anything() };
    const section = getSection(theme);
    expect(section.background.img)
      .toEqual(expect.objectContaining(expectedImg));
    expect(section.background.img)
      .not.toEqual(expect.objectContaining(unexpectedImg));
  });

  it('drops invalid image colour map', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : { src : 'image.jpg', colourMap : 1 },
        },
      },
    };
    const expectedImg = { src : 'image.jpg', mode : 'cover' };
    const unexpectedImg = { colourMap : expect.anything() };
    const section = getSection(theme);
    expect(section.background.img)
      .toEqual(expect.objectContaining(expectedImg));
    expect(section.background.img)
      .not.toEqual(expect.objectContaining(unexpectedImg));
  });

  it('drops invalid image colour map entries', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        ...testTheme.backgrounds,
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : { src : 'image.jpg', colourMap : { invalid : 0 } },
        },
      },
    };
    const unexpectedColourMap = { invalid : expect.anything() };
    const section = getSection(theme);
    expect(section.background.img?.colourMap)
      .not.toEqual(expect.objectContaining(unexpectedColourMap));
  });

  it('returns resolved image colour map', () => {
    const theme = {
      ...testTheme,
      palettes : {
        ...testTheme.palettes,
        [testTheme.sections.default.palette] : {
          ...testTheme.palettes.custom,
          value : '#123',
        },
      },
      backgrounds : {
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : { src : 'image.jpg', colourMap : { key : 'value' } },
        },
      },
    };
    const expectedBackground = { img : {
      src : 'image.jpg',
      mode : 'cover',
      colourMap : { key : '#123' },
    } };
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.objectContaining(expectedBackground));
  });

  it('returns image colour map resolved with default palette', () => {
    const theme = {
      ...testTheme,
      palettes : {
        ...testTheme.palettes,
        default : { ...testTheme.palettes.default, default : '#123' },
      },
      backgrounds : {
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : { src : 'image.jpg', colourMap : { key : 'default' } },
        },
      },
    };
    const expectedBackground = { img : {
      src : 'image.jpg',
      mode : 'cover',
      colourMap : { key : '#123' },
    } };
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.objectContaining(expectedBackground));
  });

  it('returns image colour map resolved with default theme palette', () => {
    const theme = {
      ...testTheme,
      backgrounds : {
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : { src : 'image.jpg', colourMap : { key : 'background' } },
        },
      },
    };
    const expectedBackground = { img : {
      src : 'image.jpg',
      mode : 'cover',
      colourMap : { key : defaultThemes.default.palettes.default.background },
    } };
    const section = getSection(theme);
    expect(section.background)
      .toEqual(expect.objectContaining(expectedBackground));
  });

  it('drops image colour map entries if not found', () => {
    const theme = {
      ...testTheme,
      palettes : {
        ...testTheme.palettes,
        [testTheme.sections.default.palette] : {
          ...testTheme.palettes.custom,
          value : '#123',
        },
      },
      backgrounds : {
        [testTheme.sections.default.background] : {
          ...testTheme.backgrounds.custom,
          img : {
            src : 'image.jpg',
            colourMap : { key : 'value', bad : 'bad' },
          },
        },
      },
    };
    const expectedColourMap = { key : '#123' };
    const unexpectedColourMap = { bad : expect.anything() };
    const section = getSection(theme);
    expect(section.background.img?.colourMap)
      .toEqual(expect.objectContaining(expectedColourMap));
    expect(section.background.img?.colourMap)
      .not.toEqual(expect.objectContaining(unexpectedColourMap));
  });
});

describe('getSection typography', () => {
  it('returns set typography entries', () => {
    const theme = testTheme;
    const expectedTypography = testSection.typography;
    const section = getSection(theme);
    expect(section.typography)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('returns default typography entries if not defined', () => {
    const { body : _, ...typography } =
      testTheme.typography[testTheme.sections.default.typography];
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : { ...typography },
      },
    };
    const expectedTypography = makeSection({
      typography : testTheme.typography.default,
    }).typography;
    const section = getSection(theme);
    expect(section.typography)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('returns default theme typography entries if not defined', () => {
    const theme = { ...testTheme, typography : {} };
    const expectedTypography = makeSection({
      typography : defaultThemes.default.typography.default,
    }).typography;
    const section = getSection(theme);
    expect(section.typography)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('returns default font family if font not set', () => {
    const { font : _, ...typography } =
      testTheme.typography[testTheme.sections.default.typography].body;
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...typography },
        },
      },
    };
    const expectedTypography = makeSection({
      typography : {
        ...testTheme.typography[testTheme.sections.default.typography],
        body : { ...typography },
      },
    }).typography;
    const section = getSection(theme);
    expect(section.typography)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('returns default font family if font invalid', () => {
    const { font : _, ...typography } =
      testTheme.typography[testTheme.sections.default.typography].body;
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...typography, font : 1 },
        },
      },
    };
    const expectedTypography = makeSection({
      typography : {
        ...testTheme.typography[testTheme.sections.default.typography],
        body : { ...typography },
      },
    }).typography;
    const section = getSection(theme);
    expect(section.typography)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('returns default font family if font not found', () => {
    const { font : _, ...typography } =
      testTheme.typography[testTheme.sections.default.typography].body;
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...typography, font : 'bad' },
        },
      },
    };
    const expectedTypography = makeSection({
      typography : {
        ...testTheme.typography[testTheme.sections.default.typography],
        body : { ...typography },
      },
    }).typography;
    const section = getSection(theme);
    expect(section.typography)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('returns default theme font family if default font not found', () => {
    const { default : _f, ...fonts } = testTheme.fonts;
    const { font : _t, ...typography } =
      testTheme.typography[testTheme.sections.default.typography].body;
    const theme = {
      ...testTheme,
      fonts,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...typography, font : 'bad' },
        },
      },
    };
    const expectedTypography = makeSection({
      fonts : defaultThemes.default.fonts,
      typography : {
        ...testTheme.typography[testTheme.sections.default.typography],
        body : { ...typography },
      },
    }).typography;
    const section = getSection(theme);
    expect(section.typography)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('returns default theme font size if size not set', () => {
    const { size : _, ...typography } =
      testTheme.typography[testTheme.sections.default.typography].body;
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...typography },
        },
      },
    };
    const expectedTypography = makeSection({
      typography : {
        ...testTheme.typography[testTheme.sections.default.typography],
        body : { ...typography },
      },
    }).typography;
    const section = getSection(theme);
    expect(section.typography)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('returns default font size if size invalid', () => {
    const { size : _, ...typography } =
      testTheme.typography[testTheme.sections.default.typography].body;
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...typography, size : 1 },
        },
      },
    };
    const expectedTypography = makeSection({
      typography : {
        ...testTheme.typography[testTheme.sections.default.typography],
        body : { ...typography },
      },
    }).typography;
    const section = getSection(theme);
    expect(section.typography)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('returns default font size if size not found', () => {
    const { size : _, ...typography } =
      testTheme.typography[testTheme.sections.default.typography].body;
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...typography, size : 'bad' },
        },
      },
    };
    const expectedTypography = makeSection({
      typography : {
        ...testTheme.typography[testTheme.sections.default.typography],
        body : { ...typography },
      },
    }).typography;
    const section = getSection(theme);
    expect(section.typography)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('returns default theme font size if default size not found', () => {
    const { fontSize : _f, ...defaultScale } = testTheme.scales.default;
    const { size : _t, ...typography } =
      testTheme.typography[testTheme.sections.default.typography].body;
    const theme = {
      ...testTheme,
      scales : { ...testTheme.scales, default : defaultScale },
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...typography, size : 'bad' },
        },
      },
    };
    const expectedTypography = makeSection({
      scale : { ...testTheme.scales, default : defaultScale },
      typography : {
        ...testTheme.typography[testTheme.sections.default.typography],
        body : { ...typography },
      },
    }).typography;
    const section = getSection(theme);
    expect(section.typography)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('drops invalid line height', () => {
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...testTheme.typography.custom.body, lineHeight : 1 },
        },
      },
    };
    const unexpectedTypography = { lineHeight : expect.anything() };
    const section = getSection(theme);
    expect(section.typography.body)
      .not.toEqual(expect.objectContaining(unexpectedTypography));
  });

  it('drops invalid letter spacing', () => {
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...testTheme.typography.custom.body, letterSpacing : 1 },
        },
      },
    };
    const unexpectedTypography = { letterSpacing : expect.anything() };
    const section = getSection(theme);
    expect(section.typography.body)
      .not.toEqual(expect.objectContaining(unexpectedTypography));
  });

  it('drops invalid weight', () => {
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...testTheme.typography.custom.body, weight : 1 },
        },
      },
    };
    const unexpectedTypography = { weight : expect.anything() };
    const section = getSection(theme);
    expect(section.typography.body)
      .not.toEqual(expect.objectContaining(unexpectedTypography));
  });

  it('drops invalid font style', () => {
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...testTheme.typography.custom.body, style : 1 },
        },
      },
    };
    const unexpectedTypography = { style : expect.anything() };
    const section = getSection(theme);
    expect(section.typography.body)
      .not.toEqual(expect.objectContaining(unexpectedTypography));
  });

  it('drops invalid text decoration', () => {
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...testTheme.typography.custom.body, textDecoration : 1 },
        },
      },
    };
    const unexpectedTypography = { textDecoration : expect.anything() };
    const section = getSection(theme);
    expect(section.typography.body)
      .not.toEqual(expect.objectContaining(unexpectedTypography));
  });

  it('returns resolved colour', () => {
    const theme = {
      ...testTheme,
      palettes : {
        ...testTheme.palettes,
        [testTheme.sections.default.palette] : {
          ...testTheme.palettes[testTheme.sections.default.palette],
          value : '#123456',
        },
      },
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...testTheme.typography.custom.body, colour : 'value' },
        },
      },
    };
    const expectedTypography = { colour : '#123456' };
    const section = getSection(theme);
    expect(section.typography.body)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('drops invalid colour', () => {
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...testTheme.typography.custom.body, colour : 1 },
        },
      },
    };
    const unexpectedTypography = { colour : expect.anything() };
    const section = getSection(theme);
    expect(section.typography.body)
      .not.toEqual(expect.objectContaining(unexpectedTypography));
  });

  it('drops colour if not found', () => {
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...testTheme.typography.custom.body, colour : 'bad' },
        },
      },
    };
    const unexpectedTypography = { colour : expect.anything() };
    const section = getSection(theme);
    expect(section.typography.body)
      .not.toEqual(expect.objectContaining(unexpectedTypography));
  });

  it('returns resolved shadow colour', () => {
    const theme = {
      ...testTheme,
      palettes : {
        ...testTheme.palettes,
        [testTheme.sections.default.palette] : {
          ...testTheme.palettes[testTheme.sections.default.palette],
          value : '#123456',
        },
      },
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : {
            ...testTheme.typography.custom.body,
            shadowColour : 'value',
          },
        },
      },
    };
    const expectedTypography = { shadowColour : '#123456' };
    const section = getSection(theme);
    expect(section.typography.body)
      .toEqual(expect.objectContaining(expectedTypography));
  });

  it('drops invalid shadow colour', () => {
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...testTheme.typography.custom.body, shadowColour : 1 },
        },
      },
    };
    const unexpectedTypography = { shadowColour : expect.anything() };
    const section = getSection(theme);
    expect(section.typography.body)
      .not.toEqual(expect.objectContaining(unexpectedTypography));
  });

  it('drops shadow colour if not found', () => {
    const theme = {
      ...testTheme,
      typography : {
        ...testTheme.typography,
        [testTheme.sections.default.typography] : {
          body : { ...testTheme.typography.custom.body, shadowColour : 'bad' },
        },
      },
    };
    const unexpectedTypography = { shadowColour : expect.anything() };
    const section = getSection(theme);
    expect(section.typography.body)
      .not.toEqual(expect.objectContaining(unexpectedTypography));
  });
});

describe('getSection graphics', () => {
  it('returns set graphics entries', () => {
    const theme = testTheme;
    const expectedGraphics = testSection.graphics;
    const section = getSection(theme);
    expect(section.graphics)
      .toEqual(expect.objectContaining(expectedGraphics));
  });

  it('returns default graphics entries if not defined', () => {
    const { graphic : _, ...graphics } =
      testTheme.graphics[testTheme.sections.default.graphics];
    const theme = {
      ...testTheme,
      graphics : {
        ...testTheme.graphics,
        [testTheme.sections.default.graphics] : { ...graphics },
      },
    };
    const expectedGraphics = makeSection({
      graphics : testTheme.graphics.default,
    }).graphics;
    const section = getSection(theme);
    expect(section.graphics)
      .toEqual(expect.objectContaining(expectedGraphics));
  });

  it('returns default theme graphics entries if not defined', () => {
    const theme = { ...testTheme, graphics : {} };
    const expectedGraphics = makeSection({
      graphics : defaultThemes.default.graphics.default,
    }).graphics;
    const section = getSection(theme);
    expect(section.graphics)
      .toEqual(expect.objectContaining(expectedGraphics));
  });

  it('drops invalid graphic', () => {
    const theme = {
      ...testTheme,
      graphics : {
        ...testTheme.graphics,
        [testTheme.sections.default.graphics] : {
          ...testTheme.graphics.custom,
          graphic : 1,
        },
      },
    };
    const unexpectedGraphics = { graphic : expect.anything() };
    const section = getSection(theme);
    expect(section.graphics)
      .not.toEqual(expect.objectContaining(unexpectedGraphics));
  });

  it('drops graphic with invalid src', () => {
    const theme = {
      ...testTheme,
      graphics : {
        ...testTheme.graphics,
        [testTheme.sections.default.graphics] : {
          ...testTheme.graphics.custom,
          graphic : { src : 1 },
        },
      },
    };
    const unexpectedGraphics = { graphic : expect.anything() };
    const section = getSection(theme);
    expect(section.graphics)
      .not.toEqual(expect.objectContaining(unexpectedGraphics));
  });

  it('drops invalid graphic alternate text', () => {
    const theme = {
      ...testTheme,
      graphics : {
        ...testTheme.graphics,
        [testTheme.sections.default.graphics] : {
          ...testTheme.graphics.custom,
          graphic : { src : 'graphic.jpg', alt : 1 },
        },
      },
    };
    const unexpectedGraphic = { alt : expect.anything() };
    const section = getSection(theme);
    expect(section.graphics.graphic)
      .not.toEqual(expect.objectContaining(unexpectedGraphic));
  });

  it('drops invalid graphic colour map', () => {
    const theme = {
      ...testTheme,
      graphics : {
        ...testTheme.graphics,
        [testTheme.sections.default.graphics] : {
          ...testTheme.graphics.custom,
          graphic : { src : 'graphic.jpg', colourMap : 1 },
        },
      },
    };
    const unexpectedGraphic = { colourMap : expect.anything() };
    const section = getSection(theme);
    expect(section.graphics.graphic)
      .not.toEqual(expect.objectContaining(unexpectedGraphic));
  });

  it('drops invalid graphic colour map entries', () => {
    const theme = {
      ...testTheme,
      graphics : {
        ...testTheme.graphics,
        [testTheme.sections.default.graphics] : {
          ...testTheme.graphics.custom,
          graphic : { src : 'graphic.jpg', colourMap : { invalid : 0 } },
        },
      },
    };
    const unexpectedColourMap = { invalid : expect.anything() };
    const section = getSection(theme);
    expect(section.graphics.graphic?.colourMap)
      .not.toEqual(expect.objectContaining(unexpectedColourMap));
  });

  it('returns resolved graphic colour map', () => {
    const theme = {
      ...testTheme,
      palettes : {
        ...testTheme.palettes,
        [testTheme.sections.default.palette] : {
          ...testTheme.palettes[testTheme.sections.default.palette],
          value : '#123456',
        },
      },
      graphics : {
        ...testTheme.graphics,
        [testTheme.sections.default.graphics] : {
          ...testTheme.graphics.custom,
          graphic : { src : 'graphic.jpg', colourMap : { key : 'value' } },
        },
      },
    };
    const expectedGraphics = makeSection({
      palette : {
        ...testTheme.palettes[testTheme.sections.default.palette],
        value : '#123456',
      },
      graphics : {
        ...testTheme.graphics[testTheme.sections.default.graphics],
        graphic : { src : 'graphic.jpg', colourMap : { key : '#123456' } },
      },
    }).graphics;
    const section = getSection(theme);
    expect(section.graphics)
      .toEqual(expect.objectContaining(expectedGraphics));
  });

  it('drops graphic colour map entries if not found', () => {
    const theme = {
      ...testTheme,
      graphics : {
        ...testTheme.graphics,
        [testTheme.sections.default.graphics] : {
          ...testTheme.graphics.custom,
          graphic : { src : 'graphic.jpg', colourMap : { invalid : 'bad' } },
        },
      },
    };
    const unexpectedColourMap = { invalid : expect.anything() };
    const section = getSection(theme);
    expect(section.graphics.graphic?.colourMap)
      .not.toEqual(expect.objectContaining(unexpectedColourMap));
  });
});
