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
import { wrapOriginal } from '$lib/tests/component';
import Graphic from './graphic.svelte';
import Title from './title.svelte';
import Subtitle from './subtitle.svelte';
import TitleCard from './titleCard.svelte';

vi.mock('$lib/materials/graphic.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'graphic' }),
}));
vi.mock('$lib/materials/title.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'title' }),
}));
vi.mock('$lib/materials/subtitle.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'subtitle' }),
}));

beforeAll(async () => await loadStyles());
beforeEach(() => { vi.clearAllMocks(); });

afterAll(() => { vi.restoreAllMocks(); });

describe('TitleCard', () => {
  it('renders title, subtitle, and graphic', async () => {
    const { container } = render(TitleCard, {
      title : 'Title Text',
      subtitle : 'Subtitle Text',
    });

    const title = page.elementLocator(container)
      .getByTestId('title')
      .getByText('Title Text');
    const subtitle = page.elementLocator(container)
      .getByTestId('subtitle')
      .getByText('Subtitle Text');
    await expect.element(title).toBeInTheDocument();
    await expect.element(subtitle).toBeInTheDocument();

    const graphic = page.elementLocator(container)
      .getByTestId('graphic')
      .element()
      .querySelector('img') as HTMLImageElement;

    expect(Title).toHaveBeenCalledOnce();
    expect(Title).toHaveBeenCalledWithProps(expect.objectContaining({
      centred : true,
      flex : true,
    }));
    expect(Subtitle).toHaveBeenCalledOnce();
    expect(Subtitle).toHaveBeenCalledWithProps(expect.objectContaining({
      flex : true,
    }));
    expect(Graphic).toHaveBeenCalledOnce();
    expect(Graphic).toHaveBeenCalledWithProps(expect.objectContaining({
      graphic : 'titleAccent',
    }));

    const titleBounds = title.element().getBoundingClientRect();
    const subtitleBounds = subtitle.element().getBoundingClientRect();
    const graphicBounds = graphic.getBoundingClientRect();

    expect(subtitleBounds.top).toBeGreaterThanOrEqual(titleBounds.bottom);
    expect(subtitleBounds.left).toEqual(titleBounds.left);
    expect(graphicBounds.top).toBeGreaterThan(subtitleBounds.top);
  });
});
