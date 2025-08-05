import { describe, it, expect } from 'vitest';

import type { Section } from './theme';
import { defaultTheme, getSection } from './theme';

const defaultThemes = { default : defaultTheme } as const;

const testTheme = {
  sections : { default : { palette : 'test', background : 'test' } },
  palettes : {
    default : { default : '#000', test : '#000000', custom : '#001122' },
    test : { test : '#111111' },
    custom : { custom : '#222222' },
  },
  backgrounds : {
    default : { fill : 'default' },
    test : { fill : 'test' },
    custom : { fill : 'custom' },
  },
} as const;

const testBackgroundImage = {
  src : 'testImage.jpg',
  mode : 'cover' as const,
  opacity : 1,
  colourMap : { first : '#123456', second : '#234567' },
};

function makeSection({ palette, background } : {
  palette ?: Record<string, unknown>;
  background ?: object;
}) {
  palette = palette ?? {
    ...defaultThemes.default.palettes.default,
    ...testTheme.palettes.default,
    ...testTheme.palettes[testTheme.sections.default.palette],
  };
  background = background ?? {
    ...defaultThemes.default.backgrounds.default,
    ...testTheme.backgrounds.default,
    ...testTheme.backgrounds[testTheme.sections.default.background],
  };
  return {
    palette : { ...palette },
    background : {
      ...background,
      ...(('fill' in background)
        && { fill : palette[background.fill as string] }),
    },
  } as Section;
}

const defaultSection = makeSection({
  palette : defaultThemes.default.palettes.default,
  background : defaultThemes.default.backgrounds.default,
});

const testSection = makeSection({
  palette : testTheme.palettes.test,
  background : testTheme.backgrounds.test,
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
      background : expect.objectContaining(expectedSection.background),
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
          background : 'custom',
        },
      },
    };
    const expectedSection = makeSection({
      palette : testTheme.palettes.custom,
      background : testTheme.backgrounds.custom,
    });
    const section = getSection(theme, { key : 'custom' });
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
      background : expect.objectContaining(expectedSection.background),
    }));
  });

  it('returns default section if key not found', () => {
    const theme = testTheme;
    const expectedSection = testSection;
    const section = getSection(theme, { key : 'custom' });
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
      background : expect.objectContaining(expectedSection.background),
    }));
  });

  it('returns default theme section if default not found', () => {
    const { default : _, ...sections } = testTheme.sections;
    const theme = { ...testTheme, sections };
    const palette = defaultThemes.default.sections.default.palette;
    const background = defaultThemes.default.sections.default.background;
    const expectedSection = makeSection({
      palette : testTheme.palettes[palette],
      background : testTheme.backgrounds[background],
    });
    const section = getSection(theme, { key : 'nonexistent' });
    expect(section).toEqual(expect.objectContaining({
      palette : expect.objectContaining(expectedSection.palette),
      background : expect.objectContaining(expectedSection.background),
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
