import type { LayoutServerLoad } from './$types';
import { loadThemes } from '$lib/server/theme';

export const load : LayoutServerLoad = async ({ fetch }) => {
  return { themes : await loadThemes({ fetch }) };
};
