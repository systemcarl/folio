import { isObject } from './typing';

export const defaultLocale = {
  title : 'Welcome!',
  subtitle : '',
  errors : {
    default : 'Oops.',
    invalid : 'Oops.',
    not_authenticated : 'Oops.',
    forbidden : 'Oops.',
    not_found : 'Oops.',
    unexpected : 'Oops!',
  },
} as const;

function proxy<T extends Record<string, unknown>>(
  locale : unknown,
  defaults : T,
) : T {
  if (!isObject(locale)) return defaults;
  return new Proxy<T>(defaults, {
    get(_, prop) {
      if (typeof prop !== 'string') return undefined;
      if (typeof defaults[prop] === 'string') {
        if (typeof locale[prop] === 'string') return locale[prop];
        return defaults[prop];
      }

      return proxy(
        isObject(locale[prop]) ? locale[prop] : {},
        isObject(defaults[prop]) ? defaults[prop] : {},
      );
    },
  });
}

export function buildLocale(locale : unknown) : typeof defaultLocale {
  return proxy(locale, defaultLocale);
}
