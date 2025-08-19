import { expect } from 'vitest';

expect.extend({
  toHaveBeenCalledWithProps(received : HTMLElement, expected : object) {
    try {
      expect(received).toHaveBeenCalledWith(
        expect.anything(),
        expected,
      );
      return {
        pass : true,
        message : () => 'expected "spy" to not be called with arguments\n\n'
          + this.utils.printExpected(expected),
      };
    } catch (error) {
      return {
        pass : false,
        message : () => error.message,
      };
    }
  },
});
