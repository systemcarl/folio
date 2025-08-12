import { browser } from '$app/environment';

import * as themeStore from '$lib/stores/theme';

let subscribed = false;
if (browser && !subscribed) {
  window.addEventListener('storage', (event) => {
    if (event.key !== 'theme') return;
    themeStore.setTheme(event.newValue, false);
    window.dispatchEvent(new CustomEvent(
      'themeUpdated',
      { detail : event.newValue },
    ));
  });
  subscribed = true;
}

function makeProvider({ sectionKey, typographyKey, graphicKey } : {
  sectionKey ?: string;
  typographyKey ?: string;
  graphicKey ?: string;
}) {
  const classes : string[] = [];
  if (sectionKey) classes.push(`section-${sectionKey}`);
  if (typographyKey) classes.push(`typography-${typographyKey}`);
  if (graphicKey) classes.push(`graphic-${graphicKey}`);

  return {
    provider : { class : classes.join(' ') },
  };
}

function useThemes() {
  return {
    getThemes : themeStore.getThemes,
    setThemes : themeStore.setThemes,
    getTheme : themeStore.getTheme,
    setTheme : themeStore.setTheme,
    makeProvider,
  };
}

export default useThemes;
