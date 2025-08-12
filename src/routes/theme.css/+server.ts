import type { RequestHandler } from '@sveltejs/kit';

import { getThemes } from '$lib/stores/theme';
import { compileStyles } from '$lib/utils/styles';

export const GET : RequestHandler = async () => {
  const themes = getThemes();
  const styles = compileStyles(themes);

  return new Response((styles), {
    headers : {
      'Content-Type' : 'text/css',
    },
  });
};
