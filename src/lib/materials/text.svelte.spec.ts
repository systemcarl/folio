import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  it,
  expect,
  vi,
} from 'vitest';
import { page } from '@vitest/browser/context';
import { render } from '@testing-library/svelte';

import { loadStyles } from '$lib/tests/browser';
import { makeHtml } from '$lib/tests/component';
import Text from './text.svelte';

beforeAll(async () => await loadStyles());
beforeEach(() => { vi.clearAllMocks(); });

afterAll(() => { vi.restoreAllMocks(); });

describe('Text', () => {
  it('renders content within semantic element', async () => {
    const { container } = render(Text, {
      as : 'p',
      children : makeHtml('<span>Test Text</span>'),
    });

    const content = container.querySelector('p');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Test Text');
  });

  it('applies typography', async () => {
    const { container } = render(Text, {
      typography : 'body',
      children : makeHtml('<span>Test Text</span>'),
    });

    const content = container.querySelector('.typography-body');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Test Text');
  });

  it('centres text', async () => {
    await page.viewport(769, 1024);
    const { container } = render(Text, {
      centred : true,
      children : makeHtml('<span>Test Text</span>'),
    });

    const text = container.children[0] as HTMLElement;
    const contentStyle = getComputedStyle(text);
    expect(contentStyle.textAlign).toBe('center');
  });

  it('does not centre text on mobile viewport', async () => {
    await page.viewport(768, 1024);
    const { container } = render(Text, {
      centred : true,
      children : makeHtml('<span>Test Text</span>'),
    });

    const text = container.children[0] as HTMLElement;
    const contentStyle = getComputedStyle(text);
    expect(contentStyle.textAlign).toBe('left');
  });

  it('collapses flex text', async () => {
    await page.viewport(768, 1024);
    const { container } = render(Text, {
      flex : true,
      children : makeHtml('<span>Test Text</span>'),
    });

    container.style.setProperty('width', 'min-content');

    const text = container.children[0] as HTMLElement;
    const contentStyle = getComputedStyle(text);
    expect(contentStyle.width).toBe('min-content');
  });

  it('does not collapse flex text on table viewport', async () => {
    await page.viewport(769, 1024);
    const { container } = render(Text, {
      flex : true,
      children : makeHtml('<span>Test Text</span>'),
    });

    container.style.setProperty('width', 'min-content');

    const text = container.children[0] as HTMLElement;
    const contentStyle = getComputedStyle(text);
    expect(contentStyle.width).not.toBe('min-content');
  });

  it('insets content', async () => {
    const expectedInset = 16;
    const { container } = render(Text, {
      inset : true,
      children : makeHtml('<span>Test Text</span>'),
    });

    container.style.setProperty('--padding-inset', `${expectedInset}px`);

    const text = container.children[0] as HTMLElement;
    const content = page.elementLocator(container).getByText('Test Text');

    const textBounds = text.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();

    expect(contentBounds.left).toBe(textBounds.left + expectedInset);
    expect(contentBounds.right).toBe(textBounds.right - expectedInset);
  });
});
