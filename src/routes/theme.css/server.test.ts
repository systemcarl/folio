import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';

import type { RequestEvent } from '../$types';
import { GET } from './+server';

let themes = vi.hoisted(() => ({}));
const compileStylesMock = vi.hoisted(() => vi.fn());

vi.mock('$lib/utils/styles', () => ({
  compileStyles : compileStylesMock,
}));
vi.mock('$lib/stores/theme', () => ({
  getThemes : () => themes,
}));

beforeEach(() => {
  themes = {};
  compileStylesMock.mockReturnValue('');
});

afterAll(() => { vi.restoreAllMocks(); });

describe('theme.css', () => {
  it('returns css file', async () => {
    const response = await GET({} as RequestEvent);
    expect(response.headers.get('Content-Type')).toBe('text/css');
  });

  it('returns theme css', async () => {
    themes = { test : {} };
    const css = '.test {\n\n}\n';
    compileStylesMock.mockReturnValue(css);

    const response = await GET({} as RequestEvent);

    expect(compileStylesMock).toHaveBeenCalledWith(themes);
    expect(await response.text()).toBe('.test {\n\n}\n');
  });
});
