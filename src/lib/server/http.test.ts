import { beforeEach, afterAll, describe, expect, it, vi } from 'vitest';

import { log } from './logs';
import { fetchResource, fetchJsonResource } from './http';

vi.mock('./logs', () => ({
  log : vi.fn(),
}));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockReturnValue(Promise.resolve({
    ok : true,
    text : () => Promise.resolve('fetched text'),
    json : () => Promise.resolve({ fetched : 'json' }),
  }));
});

afterAll(() => { vi.restoreAllMocks(); });

describe('fetchResource', () => {
  it('returns response text', async () => {
    fetchMock.mockResolvedValue({
      ok : true,
      text : () => Promise.resolve('fetched text'),
    });
    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/resource');
    expect(result).toEqual('fetched text');
  });

  it('returns null on fetch error', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));
    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/resource');
    expect(result).toBeNull();
  });

  it('logs a warning on fetch error', async () => {
    const error = new Error('Network error');
    fetchMock.mockRejectedValue(error);
    await fetchResource('/resource', { fetch : fetchMock });
    expect(log).toHaveBeenCalledWith({
      message : 'Error fetching resource',
      resource : '/resource',
      error,
    }, { level : 'warn' });
  });

  it('returns null when fetch not ok', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));
    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/resource');
    expect(result).toBeNull();
  });

  it('logs a warning when fetch not ok', async () => {
    fetchMock.mockResolvedValue({ ok : false, status : 404 });
    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/resource');
    expect(result).toBeNull();
    expect(log).toHaveBeenCalledWith({
      message : 'Failed to fetch resource',
      resource : '/resource',
      response : { status : 404 },
    }, { level : 'warn' });
  });

  it('returns null when text parsing fails', async () => {
    fetchMock.mockResolvedValue({
      ok : true,
      text : async () => { throw new Error('Text parsing error'); },
    });
    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/resource');
    expect(result).toBeNull();
  });

  it('logs a warning when text parsing fails', async () => {
    const error = new Error('Text parsing error');
    fetchMock.mockResolvedValue({
      ok : true,
      status : 200,
      text : async () => { throw error; },
    });
    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/resource');
    expect(result).toBeNull();
    expect(log).toHaveBeenCalledWith({
      message : 'Error reading response',
      resource : '/resource',
      response : { status : 200 },
      error,
    }, { level : 'warn' });
  });
});

describe('fetchJsonResource', () => {
  it('returns JSON response', async () => {
    fetchMock.mockResolvedValue({
      ok : true,
      json : () => Promise.resolve({ fetched : 'json' }),
    });
    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/resource');
    expect(result).toEqual({ fetched : 'json' });
  });

  it('returns null on fetch error', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));
    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/resource');
    expect(result).toBeNull();
  });

  it('logs a warning on fetch error', async () => {
    const error = new Error('Network error');
    fetchMock.mockRejectedValue(error);
    await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(log).toHaveBeenCalledWith({
      message : 'Error fetching resource',
      resource : '/resource',
      error,
    }, { level : 'warn' });
  });

  it('returns null when fetch not ok', async () => {
    fetchMock.mockResolvedValue({ ok : false, status : 404 });
    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/resource');
    expect(result).toBeNull();
  });

  it('logs a warning when fetch not ok', async () => {
    fetchMock.mockResolvedValue({ ok : false, status : 404 });
    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/resource');
    expect(result).toBeNull();
    expect(log).toHaveBeenCalledWith({
      message : 'Failed to fetch resource',
      resource : '/resource',
      response : { status : 404 },
    }, { level : 'warn' });
  });

  it('returns null when JSON parsing fails', async () => {
    fetchMock.mockResolvedValue({
      ok : true,
      json : async () => { throw new Error('Error reading JSON'); },
    });
    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/resource');
    expect(result).toBeNull();
  });

  it('logs a warning when JSON parsing fails', async () => {
    const error = new Error('Error reading JSON');
    fetchMock.mockResolvedValue({
      ok : true,
      status : 200,
      json : async () => { throw error; },
    });
    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith('/resource');
    expect(result).toBeNull();
    expect(log).toHaveBeenCalledWith({
      message : 'Error reading JSON response',
      resource : '/resource',
      response : { status : 200 },
      error,
    }, { level : 'warn' });
  });
});
