import { describe, it, expect } from 'vitest';
import { isKey, isObject, tryGet } from './typing';

describe('isKey', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['number', 42],
    ['boolean', true],
    ['array', []],
  ])('should return false for %s input', (_, input) => {
    const actual = isKey(input);
    expect(actual).toBe(false);
  });

  it('should return true for string input', () => {
    const actual = isKey('string');
    expect(actual).toBe(true);
  });
});

describe('isObject', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['number', 42],
    ['string', 'string'],
    ['boolean', true],
    ['array', []],
  ])('should return false for %s input', (_, input) => {
    const actual = isObject(input);
    expect(actual).toBe(false);
  });

  it('should return true for object input', () => {
    const actual = isObject({});
    expect(actual).toBe(true);
  });
});

describe('tryGet', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['number', 42],
    ['boolean', true],
    ['array', []],
  ])('should return undefined for %s input', (_, input) => {
    const actual = tryGet(
      input,
      'a.b',
      (v) : v is string => typeof v === 'string',
    );
    expect(actual).toBeUndefined();
  });

  it('should return undefined for non-existing path', () => {
    const actual = tryGet(
      { a : { b : 'value' } },
      'a.c',
      (v) : v is string => typeof v === 'string',
    );
    expect(actual).toBeUndefined();
  });

  it('should return undefined for invalid values', () => {
    const actual = tryGet(
      { a : { b : 'value' } },
      'a.b',
      (v) : v is number => typeof v === 'number',
    );
    expect(actual).toBeUndefined();
  });

  it.each([
    { input : { a : { b : 'value' } }, path : 'a.b', expected : 'value' },
    {
      input : { a : { b : { c : 'value' } } },
      path : 'a.b.c',
      expected : 'value',
    },
  ])('should return value for existing paths', ({ input, path, expected }) => {
    const actual = tryGet(
      input,
      path,
      (v) : v is string => typeof v === 'string',
    );
    expect(actual).toBe(expected);
  });
});
