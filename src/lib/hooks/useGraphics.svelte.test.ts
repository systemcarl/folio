import { beforeEach, afterAll, describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';

import { resetThemes as resetGraphics } from '$lib/stores/theme';

import useGraphics from './useGraphics';
import Test from './useGraphics.test.svelte';

beforeEach(() => { resetGraphics(); });
afterAll(() => { resetGraphics(); });

describe('useGraphics', () => {
  it('stores graphics', () => {
    const { getGraphics } = useGraphics();
    const expected = { test : 'test' };

    render(Test, { props : { setGraphics : () => expected } });

    const actual = getGraphics();
    expect(actual).toEqual(expected);
  });

  it('asserts src has SVG extension', () => {
    const { isGraphic } = useGraphics();
    expect(isGraphic('test.svg')).toBe(true);
  });

  it('refutes src does not have SVG extension', () => {
    const { isGraphic } = useGraphics();
    expect(isGraphic('test.png')).toBe(false);
  });

  it('renders graphic from store', () => {
    const { setGraphics } = useGraphics();
    const expected = '<svg>Test Graphic</svg>';
    setGraphics({ test : expected });

    let actual;
    render(Test, { props : {
      src : 'test',
      renderGraphic : (render) => { actual = render; } },
    });

    expect(actual).toBe(expected);
  });

  it('renders missing graphic as empty string', () => {
    let actual;
    render(Test, { props : {
      src : 'test',
      renderGraphic : (render) => { actual = render; } },
    });

    expect(actual).toBe('');
  });
});
