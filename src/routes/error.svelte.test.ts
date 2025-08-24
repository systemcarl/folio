import { beforeEach, afterAll, describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/svelte';

import { wrapOriginal } from '$lib/tests/component';
import Content from '$lib/materials/content.svelte';
import TitleCard from '$lib/materials/titleCard.svelte';

import ErrorPage from './+error.svelte';

let status = vi.hoisted(() => 500);
const error = vi.hoisted(() => ({ message : 'Test error' }));
const errorLocale = vi.hoisted(() => ({
  errors : {
    default : 'Default Message',
    invalid : 'Invalid Message',
    not_authenticated : 'Not Authenticated Message',
    forbidden : 'Forbidden Message',
    not_found : 'Not Found Message',
    unexpected : 'Unexpected Message',
  } as Record<string, string>,
}));

vi.mock('$app/state', async () => ({
  page : {
    get status() { return status; },
    get error() { return error; },
  },
}));
vi.mock('$lib/hooks/useLocale', async (original) => {
  const originalDefault =
    ((await original()) as { default : () => object; }).default;
  return {
    default : () => ({
      ...originalDefault(),
      getLocale : vi.fn(() => errorLocale),
    }),
  };
});

vi.mock('$lib/materials/content.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'content' }) };
});
vi.mock('$lib/materials/titleCard.svelte', async (original) => {
  return { default : await wrapOriginal(original, { testId : 'titleCard' }) };
});

beforeEach(() => {
  vi.clearAllMocks();
  status = 500;
});

afterAll(() => { vi.restoreAllMocks(); });

describe('/+error.svelte', () => {
  it('vertically centres content', () => {
    const { container } = render(ErrorPage);

    const content = within(container).queryByTestId('content') as HTMLElement;
    expect(content).toBeInTheDocument();
    const titleCard =
      within(container).queryByTestId('titleCard') as HTMLElement;
    expect(titleCard).toBeInTheDocument();

    expect(Content).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ verticalAlignment : 'centre' }),
    );
  });

  it.each([
    ['invalid', 400],
    ['not_authenticated', 401],
    ['forbidden', 403],
    ['not_found', 404],
    ['default', 418],
    ['unexpected', 500],
  ])('displays %s error message in title card', (key, statusCode) => {
    status = statusCode;
    render(ErrorPage);
    expect(TitleCard).toHaveBeenCalledOnce();
    expect(TitleCard).toHaveBeenCalledWithProps(expect.objectContaining({
      title : expect.stringContaining(`${statusCode} ${error.message}`),
      subtitle : errorLocale.errors[key],
    }));
  });
});
