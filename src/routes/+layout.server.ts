import type { LayoutServerLoad } from './$types';
import { loadLocale } from '$lib/server/locale';
import { loadThemes, loadGraphics } from '$lib/server/theme';

export const load : LayoutServerLoad = async ({ fetch }) => {
  const locale = await loadLocale({ fetch });
  const themes = await loadThemes({ fetch });
  const graphics = await loadGraphics(themes, { fetch });
  return { locale, themes, graphics };
};
