import { defaultTheme } from '$lib/utils/theme';

import { isObject } from '$lib/utils/typing';
import { getAllSections } from '$lib/utils/theme';

import { fetchResource, fetchJsonResource } from './http';

export { defaultTheme } from '$lib/utils/theme';

export async function loadThemes(
  { fetch } : { fetch : typeof window.fetch; },
) : Promise<Record<string, unknown>> {
  const themeConfig = (await fetchJsonResource('/theme.json', { fetch }));
  const themes = (isObject(themeConfig) && 'themes' in themeConfig)
    ? themeConfig.themes
    : {};
  if (!isObject(themes)) return { default : defaultTheme };
  return themes;
}

export async function loadGraphics(
  themes : Record<string, unknown>,
  { fetch } : { fetch : typeof window.fetch; },
) : Promise<Record<string, string>> {
  const graphics : string[] = [];
  for (const theme of Object.values(themes)) {
    const sections = getAllSections(theme);
    for (const section of Object.values(sections)) {
      if (section.background.img) {
        if (section.background.img.src.endsWith('.svg'))
          graphics.push(section.background.img.src);
      }
      for (const graphic of Object.values(section.graphics)) {
        if (!graphic.src.endsWith('.svg')) continue;
        graphics.push(graphic.src);
      }
    }
  }
  const unique = Array.from(new Set(graphics));
  const results =
    await Promise.allSettled(unique.map(src => fetchResource(src, { fetch })));

  const graphicsMap = Object.fromEntries(
    results
      .map((result, i) => result && result.status === 'fulfilled'
        ? [unique[i], result.value]
        : [unique[i], null])
      .filter(([_, result]) => result),
  );
  return graphicsMap;
}
