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
import { makeComponent } from '$lib/tests/component';
import Page from './page.svelte';

const TestContent = makeComponent({
  testId : 'content',
  style : {
    'flex-grow' : '1',
    'width' : '100%',
  },
});

beforeAll(async () => await loadStyles());
beforeEach(() => { vi.clearAllMocks(); });

afterAll(() => { vi.restoreAllMocks(); });

describe('Page', () => {
  it('renders content in page layout', async () => {
    const { container } = render(Page, { children : TestContent });

    const main = page.elementLocator(container).getByRole('main');
    const content = page.elementLocator(container).getByTestId('content');
    await expect.element(main).toBeInTheDocument();
    await expect.element(content).toBeInTheDocument();

    const mainBounds = main.element().getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();

    expect(mainBounds.left).toEqual(0);
    expect(mainBounds.top).toEqual(0);
    expect(mainBounds.width).toEqual(window.innerWidth);
    expect(mainBounds.height).toEqual(window.innerHeight);
    expect(contentBounds.left).toEqual(mainBounds.left);
    expect(contentBounds.top).toEqual(mainBounds.top);
    expect(contentBounds.right).toEqual(mainBounds.right);
    expect(contentBounds.bottom).toEqual(mainBounds.bottom);
  });
});
