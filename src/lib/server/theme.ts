import { defaultTheme } from '$lib/utils/theme';

import { log } from './logs';

export { defaultTheme } from '$lib/utils/theme';

export async function loadThemes(
  { fetch } : { fetch : typeof window.fetch; },
) : Promise<Record<string, unknown>> {
  let themeRequest : Response;
  try {
    themeRequest = await fetch('/theme.json');
  } catch {
    log({ message : 'Failed to fetch theme.json' }, { level : 'warn' });
    return { default : defaultTheme };
  }

  if (!themeRequest.ok) {
    log({
      message : 'Failed to fetch theme.json',
      response : {
        status : themeRequest.status,
        body : await themeRequest.text?.().catch(() => null),
      },
    }, { level : 'warn' });
    return { default : defaultTheme };
  }

  try {
    const loadedThemes = await themeRequest.json();
    return loadedThemes?.themes;
  } catch {
    log({
      message : 'Failed to parse theme.json',
      response : {
        status : themeRequest.status,
        body : await themeRequest.text?.().catch(() => null),
      },
    }, { level : 'warn' });
    return { default : defaultTheme };
  }
}
