import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';

import { resetThemes } from '$lib/stores/theme';

import { getThemes, setThemes, getTheme, setTheme } from '$lib/stores/theme';
import Test from './useThemes.inner.test.svelte';
import NestedTest from './useThemes.outer.test.svelte';

const section = vi.hoisted(() => ({
  typography : { body : { font : 'body' }, typography : { font : 'typ' } },
  graphics : { graphic : { src : 'graphic' } },
}));
const getSectionMock = vi.hoisted(() => vi.fn((_, _opts) => section));
vi.mock('$lib/utils/theme', async original => ({
  ...(await original()),
  getSection : getSectionMock,
}));

beforeEach(() => {
  vi.clearAllMocks();
  resetThemes();
  getSectionMock.mockImplementation((_, _opts) => section);
});

afterAll(() => {
  vi.restoreAllMocks();
  resetThemes();
});

describe('useThemes', () => {
  it('stores themes', () => {
    const expected = { test : {} };

    render(Test, { props : { setThemes : () => expected } });

    const actual = getThemes();
    expect(actual).toEqual(expected);
  });

  it('retrieves empty object if no themes stored', () => {
    const store = getThemes();
    expect(store).toEqual({});
  });

  it('retrieves stored themes', () => {
    const expected = { test : {} };
    setThemes(expected);

    let actual;
    render(Test, { props : { getThemes : (themes) => { actual = themes; } } });

    expect(actual).toEqual(expected);
  });

  it('sets theme', () => {
    setThemes({ default : {}, test : {} });
    const expected = 'test';

    render(Test, { props : { setTheme : () => expected } });

    const actual = getTheme();
    expect(actual).toEqual(expected);
  });

  it('gets theme', () => {
    setThemes({ default : {}, test : {} });
    const expected = 'test';
    setTheme(expected);

    let actual;
    render(Test, { props : { getTheme : (theme) => { actual = theme; } } });

    expect(actual).toEqual(expected);
  });

  it('makes section provider', () => {
    let className;
    render(Test, { props : { makeProvider : {
      keys : { sectionKey : 'test' },
      className : (name) => { className = name; },
    } } });

    expect(className).toBe('section-test');
  });

  it('makes typography provider', () => {
    let className;
    render(Test, { props : { makeProvider : {
      keys : { typographyKey : 'test' },
      className : (name) => { className = name; },
    } } });

    expect(className).toBe('typography-test');
  });

  it('makes graphic provider', () => {
    let className;
    render(Test, { props : { makeProvider : {
      keys : { graphicKey : 'test' },
      className : (name) => { className = name; },
    } } });

    expect(className).toBe('graphic-test');
  });

  it('combines provides', () => {
    let className;
    render(Test, { props : { makeProvider : {
      keys : {
        sectionKey : 'section',
        typographyKey : 'typography',
        graphicKey : 'graphic',
      },
      className : (name) => { className = name; },
    } } });

    expect(className).toContain('section-section');
    expect(className).toContain('typography-typography');
    expect(className).toContain('graphic-graphic');
  });

  it('forwards local storage events to theme update listeners', () => {
    const result : string[] = [];
    window.addEventListener('themeUpdated', (event : unknown) => {
      result.push((event as { detail : string; }).detail);
    });

    window.dispatchEvent(new StorageEvent(
      'storage',
      { key : 'theme', newValue : 'test' },
    ));

    expect(result).toEqual(['test']);
  });

  it('loads client theme', () => {
    setThemes({ default : {}, test : {} });

    window.dispatchEvent(new StorageEvent(
      'storage',
      { key : 'theme', newValue : 'test' },
    ));
    render(Test);

    const result = getTheme();
    expect(result).toEqual('test');
  });

  it('sets client theme on local storage event', () => {
    setThemes({ default : {}, test : {} });

    render(Test);
    window.dispatchEvent(new StorageEvent(
      'storage',
      { key : 'theme', newValue : 'test' },
    ));
    const result = getTheme();

    expect(result).toEqual('test');
  });

  it('defaults client theme on unexpected storage event', () => {
    setThemes({ test : {} });

    render(Test);
    window.dispatchEvent(new StorageEvent(
      'storage',
      { key : 'theme', newValue : 'unexpected' },
    ));
    const result = getTheme();

    expect(result).toEqual('test');
  });

  it('passes section context', () => {
    const expected = section;

    let actual;
    render(NestedTest, { props : {
      makeProvider : { keys : { sectionKey : 'test' } },
      innerProps : { getSection : (section) => { actual = section; } },
    } });

    expect(getSectionMock)
      .toHaveBeenCalledWith(expect.anything(), { key : 'test' });
    expect(actual).toEqual(expected);
  });

  it('passes typography context', () => {
    const expected = section.typography.typography;

    let actual;
    render(NestedTest, { props : {
      makeProvider : { keys : { typographyKey : 'typography' } },
      innerProps : { getTypography : (typography) => { actual = typography; } },
    } });

    expect(actual).toEqual(expected);
  });

  it('does not overwrite section context with typography context', () => {
    const expected = section;

    let actual;
    render(NestedTest, { props : {
      makeProvider : { keys : { sectionKey : 'test' } },
      innerProps : {
        makeProvider : { keys : { typographyKey : 'typography' } },
        getSection : (section) => { actual = section; },
      },
    } });

    expect(getSectionMock)
      .toHaveBeenCalledWith(expect.anything(), { key : 'test' });
    expect(actual).toEqual(expected);
  });

  it('passes graphic context', () => {
    const expected = section.graphics.graphic;

    let actual;
    render(NestedTest, { props : {
      makeProvider : { keys : { graphicKey : 'graphic' } },
      innerProps : { getGraphic : (graphic) => { actual = graphic; } },
    } });

    expect(actual).toEqual(expected);
  });

  it('does not overwrite section context with graphic context', () => {
    const expected = section;

    let actual;
    render(NestedTest, { props : {
      makeProvider : { keys : { sectionKey : 'test' } },
      innerProps : {
        makeProvider : { keys : { graphicKey : 'graphic' } },
        getSection : (section) => { actual = section; },
      },
    } });

    expect(getSectionMock)
      .toHaveBeenCalledWith(expect.anything(), { key : 'test' });
    expect(actual).toEqual(expected);
  });

  it('passes themes store updates', async () => {
    setThemes({ default : { default : {} }, test : { test : {} } });

    let actual;
    const props = {
      makeProvider : { keys : { sectionKey : 'test' } },
      innerProps : {
        onSectionChange : (section : unknown) => { actual = section; },
      },
    };
    const rendered = render(NestedTest, { props });
    await rendered.rerender({ ...props, setTheme : () => 'test' });

    expect(getSectionMock)
      .toHaveBeenCalledWith({ default : {} }, { key : 'test' });
    expect(getSectionMock)
      .toHaveBeenCalledWith({ test : {} }, { key : 'test' });
    expect(actual).toEqual(section);
  });

  it('passes section context updates', async () => {
    let actual;
    const props = {
      makeProvider : { keys : { sectionKey : 'default' } },
      innerProps : {
        onSectionChange : (section : unknown) => { actual = section; },
      },
    };
    const rendered = render(NestedTest, { props });
    await rendered.rerender({ ...props, setSection : () => 'test' });

    expect(getSectionMock)
      .toHaveBeenCalledWith(expect.anything(), { key : 'default' });
    expect(getSectionMock)
      .toHaveBeenCalledWith(expect.anything(), { key : 'test' });
    expect(actual).toEqual(section);
  });

  it('does not pass unregistered section context updates', async () => {
    const props = {
      makeProvider : { keys : {} },
      innerProps : { onSectionChange : () => {} },
    };
    const rendered = render(NestedTest, { props });
    await rendered.rerender({ ...props, setSection : () => 'test' });

    expect(getSectionMock)
      .not.toHaveBeenCalledWith(expect.anything(), { key : 'test' });
  });

  it('passes section context typography update', async () => {
    const expected = {
      ...section,
      typography : { ...section.typography, body : { font : 'typography' } },
    };
    const unexpected = {
      ...section,
      typography : { ...section.typography, body : { font : 'default' } },
    };
    getSectionMock.mockImplementation((_, { key }) => {
      if (key === 'typography') return expected;
      else return unexpected;
    });

    let actual;
    const props = {
      makeProvider : { keys : {
        sectionKey : 'default',
        typographyKey : 'body',
      } },
      innerProps : {
        onTypographyChange : (typography : unknown) => { actual = typography; },
      },
    };
    const rendered = render(NestedTest, { props });
    await rendered.rerender({ ...props, setSection : () => 'typography' });

    expect(actual).toEqual(expected.typography.body);
  });

  it('passes typography context updates', async () => {
    let actual;
    const props = {
      makeProvider : { keys : { typographyKey : 'body' } },
      innerProps : {
        onTypographyChange : (typography : unknown) => { actual = typography; },
      },
    };
    const rendered = render(NestedTest, { props });
    await rendered.rerender({ ...props, setTypography : () => 'typography' });

    expect(actual).toEqual(section.typography.typography);
  });

  it('does not pass unregistered typography context updates', async () => {
    let actual;
    const props = {
      makeProvider : { keys : {} },
      innerProps : {
        onTypographyChange : (typography : unknown) => { actual = typography; },
      },
    };
    const rendered = render(NestedTest, { props });
    await rendered.rerender({ ...props, setTypography : () => 'typography' });

    expect(actual).not.toEqual(section.typography.typography);
  });

  it('passes section context graphic update', async () => {
    const expected = {
      ...section,
      graphics : { ...section.graphics, graphic : { src : 'graphic' } },
    };
    const unexpected = {
      ...section,
      graphics : { ...section.graphics, graphic : { src : 'default' } },
    };
    getSectionMock.mockImplementation((_, { key }) => {
      if (key === 'graphic') return expected;
      else return unexpected;
    });

    let actual;
    const props = {
      makeProvider : { keys : {
        sectionKey : 'default',
        graphicKey : 'graphic',
      } },
      innerProps : {
        onGraphicChange : (graphic : unknown) => { actual = graphic; },
      },
    };
    const rendered = render(NestedTest, { props });
    await rendered.rerender({ ...props, setSection : () => 'graphic' });

    expect(actual).toEqual(expected.graphics.graphic);
  });

  it('passes graphic context updates', async () => {
    let actual;
    const props = {
      makeProvider : { keys : { graphicKey : '' } },
      innerProps : {
        onGraphicChange : (graphic : unknown) => { actual = graphic; },
      },
    };
    const rendered = render(NestedTest, { props });
    await rendered.rerender({ ...props, setGraphic : () => 'graphic' });

    expect(actual).toEqual(section.graphics.graphic);
  });

  it('does not pass unregistered graphic context updates', async () => {
    let actual;
    const props = {
      makeProvider : { keys : {} },
      innerProps : {
        onGraphicChange : (graphic : unknown) => { actual = graphic; },
      },
    };
    const rendered = render(NestedTest, { props });
    await rendered.rerender({ ...props, setGraphic : () => 'graphic' });

    expect(actual).not.toEqual(section.graphics.graphic);
  });
});
