import { describe, it, expect, vi } from 'vitest';

import type { PageServerLoadEvent } from './$types';
import { _messages, load } from './+page.server';

const event = {
  request : new Request('http://localhost/test', {
    method : 'GET',
    headers : { 'Content-Type' : 'application/json' },
  }),
  url : new URL('http://localhost/'),
  fetch : vi.fn(),
} as unknown as PageServerLoadEvent;

describe('+page.server', () => {
  it('throws error with status code', async () => {
    const status = 418;
    const params = { code : status.toString() };
    const error = load({ ...event, params });
    await expect(error).rejects.toHaveProperty('status', status);
  });

  it('throws error with expected message', async () => {
    const status = 500;
    const params = { code : status.toString() };
    const error = load({ ...event, params });
    await expect(error).rejects.toHaveProperty('body', expect.objectContaining({
      message : _messages[status],
    }));
  });
});
