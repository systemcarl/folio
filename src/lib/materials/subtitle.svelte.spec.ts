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
import Subtitle from './subtitle.svelte';

vi.mock('$lib/materials/text.svelte', { spy : true });

beforeAll(async () => await loadStyles());
beforeEach(() => { vi.clearAllMocks(); });

afterAll(() => { vi.restoreAllMocks(); });

describe('Subtitle', () => {
  it('renders subtitle text', async () => {
    const { container } = render(Subtitle, {
      flex : false,
      as : 'h2',
      children : makeHtml('<span>Subtitle Text</span>'),
    });

    expect(Text).toHaveBeenCalledOnce();
    expect(Text).toHaveBeenCalledWithProps(expect.objectContaining({
      flex : false,
      as : 'h2',
      inset : true,
      typography : 'subtitle',
    }));

    const content = page.elementLocator(container).getByText('Subtitle Text');
    await expect.element(content).toBeInTheDocument();
  });
});
