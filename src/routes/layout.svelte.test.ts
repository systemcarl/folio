import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import type { Snippet } from 'svelte';
import { render, within } from '@testing-library/svelte';

import { makeComponent, wrapOriginal } from '$lib/tests/component';
import Page from '$lib/materials/page.svelte';

import Layout from './+layout.svelte';

const setLocaleMock = vi.hoisted(() => vi.fn());
const setThemesMock = vi.hoisted(() => vi.fn());
const setGraphicsMock = vi.hoisted(() => vi.fn());

vi.mock('$lib/hooks/useLocale', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      setLocale : setLocaleMock,
    }),
  };
});
vi.mock('$lib/hooks/useThemes', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      setThemes : setThemesMock,
    }),
  };
});
vi.mock('$lib/hooks/useGraphics', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      setGraphics : setGraphicsMock,
    }),
  };
});

vi.mock('$lib/materials/page.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'page' }),
}));

const data = {
  locale : {},
  themes : {},
  graphics : { graphic : '<svg></svg>' },
};

const TestContent = makeComponent({ testId : 'content' });

beforeEach(() => { vi.clearAllMocks(); });
afterAll(() => { vi.restoreAllMocks(); });

describe('/+layout.svelte', () => {
  it('renders', () => {
    render(Layout, { data, children : ((() => {}) as Snippet<[]>) });
  });

  it('stores loaded locale', () => {
    const expected = { test : {} };
    render(Layout, {
      data : { ...data, locale : expected },
      children : ((() => {}) as Snippet<[]>),
    });
    expect(setLocaleMock).toHaveBeenCalledWith(expected);
  });

  it('stores loaded themes', () => {
    const expected = { test : {} };
    render(Layout, {
      data : { ...data, themes : expected },
      children : ((() => {}) as Snippet<[]>),
    });
    expect(setThemesMock).toHaveBeenCalledWith(expected);
  });

  it('sets loaded graphics', () => {
    const expected = { test : '<svg>Test</svg>' };
    render(Layout, {
      data : { ...data, graphics : expected },
      children : ((() => {}) as Snippet<[]>),
    });
    expect(setGraphicsMock).toHaveBeenCalledWith(expected);
  });
});

describe('/+layout.svelte render', () => {
  it('wraps content in page', () => {
    const { container } = render(Layout, { data, children : TestContent });

    const page = within(container).queryByTestId('page') as HTMLElement;
    expect(page).toBeInTheDocument();
    expect(within(page).queryByTestId('content')).toBeInTheDocument();
    expect(Page).toHaveBeenCalledOnce();
  });
});
