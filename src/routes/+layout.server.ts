import type { LayoutServerLoad } from './$types';
import { loadThemes, loadGraphics } from '$lib/server/theme';

export const load : LayoutServerLoad = async ({ fetch }) => {
  const themes = await loadThemes({ fetch });
  const graphics = await loadGraphics(themes, { fetch });
  return { themes, graphics };
};
