import 'vitest';

declare global {
  namespace App {

  }
}

declare module 'vitest' {
  interface Assertion {
    toHaveBeenCalledWithProps(expected : object) : void;
  }
}

export {};
