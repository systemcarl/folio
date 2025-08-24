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
import { makeComponent, wrapOriginal } from '$lib/tests/component';
import Content from './content.svelte';

vi.mock('./background.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'background' }),
}));

const TestContent = makeComponent({
  testId : 'content',
  style : {
    width : '100%',
    height : '100px',
  },
});

beforeAll(async () => await loadStyles());
beforeEach(() => { vi.clearAllMocks(); });

afterAll(() => { vi.restoreAllMocks(); });

describe('Content', () => {
  it('renders content layout', async () => {
    const expectedSpacing = 64;

    const { container } = render(Content, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('--layout-spacing', `${expectedSpacing}px`);

    const section = container.querySelector('section') as HTMLElement;
    expect(section).toBeInTheDocument();

    const background = page.elementLocator(container).getByTestId('background');
    const content = background.getByTestId('content');
    await expect.element(background).toBeInTheDocument();
    await expect.element(content).toBeInTheDocument();

    const layout = content.element().parentElement as HTMLElement;
    await expect.element(layout).toBeInTheDocument();

    const layoutStyle = getComputedStyle(layout);
    expect(layoutStyle.display).toBe('flex');
    expect(layoutStyle.flexDirection).toBe('column');
    expect(layoutStyle.justifyContent).toBe('center');
    expect(layoutStyle.alignItems).toBe('flex-start');

    const containerBounds = container.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();
    expect(contentBounds.left)
      .toEqual(containerBounds.left + expectedSpacing);
    expect(contentBounds.right)
      .toEqual(containerBounds.right - expectedSpacing);
    expect(contentBounds.top)
      .toEqual(containerBounds.top + expectedSpacing);
    expect(contentBounds.bottom)
      .toBeLessThanOrEqual(containerBounds.bottom - expectedSpacing);
  });

  it('renders content vertically centered layout', async () => {
    const expectedSpacing = 64;

    const { container } = render(
      Content,
      { verticalAlignment : 'centre', children : TestContent },
    );

    container.style.setProperty('display', 'flex');
    container.style.setProperty('height', '500px');
    container.style.setProperty('--layout-spacing', `${expectedSpacing}px`);

    const section = container.querySelector('section') as HTMLElement;
    expect(section).toBeInTheDocument();

    const background = page.elementLocator(container).getByTestId('background');
    const content = background.getByTestId('content');
    await expect.element(background).toBeInTheDocument();
    await expect.element(content).toBeInTheDocument();

    const layout = content.element().parentElement as HTMLElement;
    await expect.element(layout).toBeInTheDocument();

    const layoutStyle = getComputedStyle(layout);
    expect(layoutStyle.display).toBe('flex');
    expect(layoutStyle.flexDirection).toBe('column');
    expect(layoutStyle.justifyContent).toBe('center');
    expect(layoutStyle.alignItems).toBe('center');

    const containerBounds = container.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();
    expect(contentBounds.left)
      .toEqual(containerBounds.left + expectedSpacing);
    expect(contentBounds.right)
      .toEqual(containerBounds.right - expectedSpacing);
    expect(contentBounds.top)
      .toBeGreaterThan(containerBounds.top + expectedSpacing);
    expect(contentBounds.bottom)
      .toBeLessThan(containerBounds.bottom - expectedSpacing);
    expect(contentBounds.top - containerBounds.top)
      .toEqual(containerBounds.bottom - contentBounds.bottom);
  });
});
