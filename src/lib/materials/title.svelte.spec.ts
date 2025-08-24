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
import Title from './title.svelte';

vi.mock('$lib/materials/text.svelte', { spy : true });

beforeAll(async () => await loadStyles());
beforeEach(() => { vi.clearAllMocks(); });

afterAll(() => { vi.restoreAllMocks(); });

describe('Title', () => {
  it('renders title text', async () => {
    const { container } = render(Title, {
      flex : false,
      as : 'h1',
      children : makeHtml('<span>Title Text</span>'),
    });

    expect(Text).toHaveBeenCalledOnce();
    expect(Text).toHaveBeenCalledWithProps(expect.objectContaining({
      flex : false,
      as : 'h1',
      typography : 'title',
    }));
    expect(Text)
      .not.toHaveBeenCalledWithProps(expect.objectContaining({ inset : true }));

    const content = page.elementLocator(container).getByText('Title Text');
    await expect.element(content).toBeInTheDocument();
  });
});
