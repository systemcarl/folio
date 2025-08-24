import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  it,
  expect,
  vi,
} from 'vitest';
import { tick } from 'svelte';
import { render } from '@testing-library/svelte';

import { loadStyles } from '$lib/tests/browser';
import Graphic from './graphic.svelte';

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

const defaultGraphic = vi.hoisted(() => ({
  src : 'default-graphic.svg',
  alt : 'Default Graphic',
}));

let graphic = vi.hoisted(() => defaultGraphic as unknown);
let graphicContent = vi.hoisted(() => '');

let updateGraphic = vi.hoisted(() => (() => {}) as (arg : unknown) => void);

vi.mock('$lib/hooks/useThemes', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      onGraphicChange : vi.fn((callback) => {
        updateGraphic = callback;
        callback(graphic);
      }),
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

beforeAll(async () => await loadStyles());
beforeEach(() => { vi.clearAllMocks(); });

afterAll(() => { vi.restoreAllMocks(); });

describe('Graphic', () => {
  it('renders source image', () => {
    const { container } = render(
      Graphic,
      { src : 'test-graphic.png', alt : 'Test Graphic' },
    );

    container.style.setProperty('display', 'block');
    container.style.setProperty('width', '200px');
    container.style.setProperty('height', '200px');
    container.style.setProperty('margin', '0 auto');

    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'test-graphic.png');
    expect(img).toHaveAttribute('alt', 'Test Graphic');

    const containerBounds = container.getBoundingClientRect();
    const imgBounds = img.getBoundingClientRect();

    expect(imgBounds.left).toEqual(containerBounds.left);
    expect(imgBounds.top).toEqual(containerBounds.top);
    expect(imgBounds.right).toEqual(containerBounds.right);
    expect(imgBounds.bottom).toEqual(containerBounds.bottom);
  });

  it('renders graphic image', () => {
    graphic = { src : 'test-graphic.png', alt : 'Test Graphic' };

    const { container } = render(Graphic);

    container.style.setProperty('display', 'block');
    container.style.setProperty('width', '200px');
    container.style.setProperty('height', '200px');
    container.style.setProperty('margin', '0 auto');

    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'test-graphic.png');
    expect(img).toHaveAttribute('alt', 'Test Graphic');

    const containerBounds = container.getBoundingClientRect();
    const imgBounds = img.getBoundingClientRect();

    expect(imgBounds.left).toEqual(containerBounds.left);
    expect(imgBounds.top).toEqual(containerBounds.top);
    expect(imgBounds.right).toEqual(containerBounds.right);
    expect(imgBounds.bottom).toEqual(containerBounds.bottom);
  });

  it('renders graphic SVG', async () => {
    graphic = { src : 'test-graphic.svg' };
    graphicContent = svgTemplate('Test Graphic');

    const { container } = render(Graphic);

    container.style.setProperty('display', 'block');
    container.style.setProperty('width', '200px');
    container.style.setProperty('height', '200px');
    container.style.setProperty('margin', '0 auto');

    const svg = container.querySelector('svg') as SVGElement;
    expect(svg).toBeInTheDocument();
    expect(svg.outerHTML).toContain('Test Graphic');

    graphicContent = svgTemplate('Updated Graphic');
    updateGraphic(graphic);

    await tick();

    const updatedSvg = container.querySelector('svg') as SVGElement;
    expect(updatedSvg).toBeInTheDocument();
    expect(updatedSvg.outerHTML).toContain('Updated Graphic');

    const containerBounds = container.getBoundingClientRect();
    const svgBounds = updatedSvg.getBoundingClientRect();

    expect(svgBounds.left).toEqual(containerBounds.left);
    expect(svgBounds.top).toEqual(containerBounds.top);
    expect(svgBounds.right).toEqual(containerBounds.right);
    expect(svgBounds.bottom).toEqual(containerBounds.bottom);
  });
});
