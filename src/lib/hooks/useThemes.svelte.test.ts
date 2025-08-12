import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';

import { resetThemes } from '$lib/stores/theme';

import { getThemes, setThemes, getTheme, setTheme } from '$lib/stores/theme';
import Test from './useThemes.test.svelte';

beforeEach(() => {
  vi.clearAllMocks();
  resetThemes();
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
});
