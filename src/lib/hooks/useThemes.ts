import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

import type { Section, Typography, Graphic } from '$lib/utils/theme';
import * as themeStore from '$lib/stores/theme';

let subscribed = false;
if (browser && !subscribed) {
  themeStore.setTheme(localStorage.getItem('theme'), false);

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

function useThemes() {
  const sectionKey = writable(themeStore.getSectionContext());
  const typographyKey = writable(themeStore.getTypographyContext());
  const graphicKey = writable(themeStore.getGraphicContext());

  const section = writable<Section>(
    themeStore.getThemeSection(get(sectionKey)),
  );
  const typography = writable<Typography>(
    themeStore.getSectionTypography(get(section), get(typographyKey)),
  );
  const graphic = writable<Graphic | undefined>(
    themeStore.getSectionGraphic(get(section), get(graphicKey)),
  );

  function handleSectionChange(key : string | undefined) {
    if (key !== undefined) sectionKey.set(key);
    section.set(themeStore.getThemeSection(key ?? get(sectionKey)));
  }
  let unsubscribeSection = themeStore.onSectionChange(handleSectionChange);

  function handleTypographyChange(key : string | undefined) {
    if (key !== undefined) typographyKey.set(key);
    const currentSection = themeStore.getThemeSection(get(sectionKey));
    typography.set(themeStore.getSectionTypography(
      currentSection,
      key ?? get(typographyKey),
    ));
  }
  let unsubscribeTypography =
    themeStore.onTypographyChange(handleTypographyChange);

  function handleGraphicChange(key : string | undefined) {
    if (key !== undefined) graphicKey.set(key);
    const currentSection = themeStore.getThemeSection(get(sectionKey));
    graphic.set(themeStore.getSectionGraphic(
      currentSection,
      key ?? get(graphicKey),
    ));
  }
  let unsubscribeGraphic = themeStore.onGraphicChange(handleGraphicChange);

  function getSection() { return get(section); }
  function getTypography() { return get(typography); }
  function getGraphic() { return get(graphic); }

  function onSectionChange(callback : (section : Section) => void) {
    return section.subscribe(callback);
  }
  function onTypographyChange(callback : (typography : Typography) => void) {
    return typography.subscribe(callback);
  }
  function onGraphicChange(callback : (graphic : Graphic | undefined) => void) {
    return graphic.subscribe(callback);
  }

  function makeProvider({ sectionKey, typographyKey, graphicKey } : {
    sectionKey ?: string;
    typographyKey ?: string;
    graphicKey ?: string;
  }) {
    if (sectionKey !== undefined) {
      unsubscribeSection();
      themeStore.setSectionContext(sectionKey);
      unsubscribeSection = themeStore.onSectionChange(handleSectionChange);
    }
    if (typographyKey !== undefined) {
      unsubscribeTypography();
      themeStore.setTypographyContext(typographyKey);
      unsubscribeTypography =
        themeStore.onTypographyChange(handleTypographyChange);
    }
    if (graphicKey !== undefined) {
      unsubscribeGraphic();
      themeStore.setGraphicContext(graphicKey);
      unsubscribeGraphic = themeStore.onGraphicChange(handleGraphicChange);
    }

    const classes : string[] = [];
    if (sectionKey) classes.push(`section-${sectionKey}`);
    if (typographyKey) classes.push(`typography-${typographyKey}`);
    if (graphicKey) classes.push(`graphic-${graphicKey}`);

    return {
      provider : { class : classes.join(' ') },
      setSection : (sectionKey !== undefined)
        ? themeStore.updateSectionContext
        : () => {},
      setTypography : (typographyKey !== undefined)
        ? themeStore.updateTypographyContext
        : () => {},
      setGraphic : (graphicKey !== undefined)
        ? themeStore.updateGraphicContext
        : () => {},
    };
  }

  return {
    getThemes : themeStore.getThemes,
    setThemes : themeStore.setThemes,
    getTheme : themeStore.getTheme,
    setTheme : themeStore.setTheme,
    getSection : getSection,
    getTypography : getTypography,
    getGraphic : getGraphic,
    onSectionChange : onSectionChange,
    onTypographyChange : onTypographyChange,
    onGraphicChange : onGraphicChange,
    makeProvider,
  };
}

export default useThemes;
