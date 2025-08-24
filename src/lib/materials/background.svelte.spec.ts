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
import Graphic from './graphic.svelte';
import Background from './background.svelte';

const svgTemplate = (text : string) => `
<svg width="100%" height="100%">
  <text
    x="50%"
    y="50%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="sans-serif"
    font-style="italic"
  >
    ${text}
  </text>
</svg>
`;

const defaultSection = vi.hoisted(() => ({
  background : { fill : '#FFF' },
}));

let section = vi.hoisted(() => defaultSection as unknown);
let graphicContent = vi.hoisted(() => '');

let updateSelection = vi.hoisted(() => (() => {}) as (arg : unknown) => void);

const onSectionChangeMock = vi.hoisted(() => vi.fn((callback) => {
  updateSelection = callback;
  callback(section);
}));

vi.mock('$lib/hooks/useThemes', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      getSection : vi.fn(() => section),
      onSectionChange : onSectionChangeMock,
    }),
  };
});
vi.mock('$lib/hooks/useGraphics', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      isGraphic : vi.fn(() => !!graphicContent),
      renderGraphic : vi.fn(() => graphicContent),
    }),
  };
});

vi.mock('./graphic.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'graphic' }),
}));

const TestContent = makeComponent({
  testId : 'content',
  style : {
    width : '100%',
    height : '100px',
  },
});

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  onSectionChangeMock.mockImplementation((callback) => {
    updateSelection = callback;
    callback(section);
  });
  section = defaultSection;
  graphicContent = '';
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Background', () => {
  it('renders background fill', async () => {
    section = { background : { fill : '#FFF' } };

    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-colour', 'rgb(220, 220, 220)');

    const background = container.children[0] as HTMLElement;
    await expect.element(background).toBeInTheDocument();
    const content = page.elementLocator(background).getByTestId('content');
    await expect.element(content).toBeInTheDocument();

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).not.toBeInTheDocument();

    const backgroundStyle = getComputedStyle(background);
    const contentStyle = getComputedStyle(content.element());
    const containerBounds = container.getBoundingClientRect();
    const backgroundBounds = background.getBoundingClientRect();

    expect(backgroundStyle.backgroundColor).toBe('rgb(220, 220, 220)');
    expect(backgroundStyle.backgroundImage).toBe('none');

    const backgroundZIndex = backgroundStyle.getPropertyValue('z-index');
    const contentZIndex = contentStyle.getPropertyValue('z-index');
    expect((backgroundZIndex !== 'auto' ? Number(backgroundZIndex) : 0))
      .toBeLessThan((contentZIndex !== 'auto' ? Number(contentZIndex) : 0));

    expect(backgroundBounds.left).toBeLessThanOrEqual(containerBounds.left);
    expect(backgroundBounds.top).toBeLessThanOrEqual(containerBounds.top);
    expect(backgroundBounds.right)
      .toBeGreaterThanOrEqual(containerBounds.right);
    expect(backgroundBounds.bottom)
      .toBeGreaterThanOrEqual(containerBounds.bottom);
  });

  it('renders cover background image', async () => {
    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-img', 'url(test-background.png)');
    container.style.setProperty('--bg-size', 'cover');
    container.style.setProperty('--bg-repeat', 'no-repeat');

    const background = container.children[0] as HTMLElement;
    await expect.element(background).toBeInTheDocument();

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).not.toBeInTheDocument();

    const backgroundStyle = getComputedStyle(background);

    expect(backgroundStyle.backgroundImage).toContain('/test-background.png');
    expect(backgroundStyle.backgroundSize).toBe('cover');
    expect(backgroundStyle.backgroundRepeat).toBe('no-repeat');
  });

  it('renders tiled background image', async () => {
    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');
    container.style.setProperty('--bg-img', 'url(test-background.png)');
    container.style.setProperty('--bg-size', 'auto');
    container.style.setProperty('--bg-repeat', 'repeat');

    const background = container.children[0] as HTMLElement;
    await expect.element(background).toBeInTheDocument();

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).not.toBeInTheDocument();

    const backgroundStyle = getComputedStyle(background);

    expect(backgroundStyle.backgroundImage).toContain('/test-background.png');
    expect(backgroundStyle.backgroundSize).toBe('auto');
    expect(backgroundStyle.backgroundRepeat).toBe('repeat');
  });

  it('renders SVG background image', async () => {
    section = { background : { img : { src : 'test-background.svg' } } };
    graphicContent = svgTemplate('Background Graphic');

    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('--bg-img', 'url(test-background.png)');

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');

    const background = container.children[0] as HTMLElement;

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).toBeInTheDocument();

    const svg = backgroundGraphic.element().querySelector('svg') as SVGElement;
    await expect.element(svg).toBeInTheDocument();

    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      src : 'test-background.svg',
    }));

    updateSelection({ background : { img : {
      src : 'updated-background.svg',
    } } });

    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      src : 'updated-background.svg',
    }));

    const backgroundStyle = getComputedStyle(background);
    const backgroundBounds = background.getBoundingClientRect();
    const svgBounds = svg.getBoundingClientRect();

    expect(backgroundStyle.backgroundImage).toBe('none');

    expect(backgroundBounds.top).toBeGreaterThanOrEqual(svgBounds.top);
    expect(backgroundBounds.left).toBeGreaterThanOrEqual(svgBounds.left);
    expect(backgroundBounds.right).toBeLessThanOrEqual(svgBounds.right);
    expect(backgroundBounds.bottom).toBeLessThanOrEqual(svgBounds.bottom);
  });

  it('renders SVG background image on first pass', async () => {
    section = { background : { img : { src : 'test-background.svg' } } };
    graphicContent = svgTemplate('Background Graphic');
    onSectionChangeMock.mockImplementation(() => {});

    const { container } = render(Background, { children : TestContent });

    container.style.setProperty('--bg-img', 'url(test-background.png)');

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('height', '200px');

    const background = container.children[0] as HTMLElement;

    const backgroundGraphic =
      page.elementLocator(background).getByTestId('graphic');
    await expect.element(backgroundGraphic).toBeInTheDocument();

    const svg = backgroundGraphic.element().querySelector('svg') as SVGElement;
    await expect.element(svg).toBeInTheDocument();

    const backgroundStyle = getComputedStyle(background);
    expect(backgroundStyle.backgroundImage).toBe('none');
  });
});
