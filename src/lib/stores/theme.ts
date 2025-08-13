import type { Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';

import type { Section } from '$lib/utils/theme';
import { defaultTheme, getSection } from '$lib/utils/theme';

type KeyStore = Writable<string | undefined>;

export const contextKeys = {
  section : Symbol('section'),
  typography : Symbol('typography'),
  graphic : Symbol('graphic'),
};

let themes = writable<Record<string, unknown>>({});
let theme = writable('default');

export function resetThemes() {
  themes = writable({});
  theme = writable('default');
}

export function getThemes() { return get(themes); }

export function setThemes(newThemes : Record<string, unknown>) {
  themes.set(newThemes);
}

export function getTheme() { return get(theme); }

export function setTheme(key ?: string | null, setStorage = true) {
  const storedThemes = getThemes();
  if ((typeof key !== 'string') || !(key in storedThemes))
    key = Object.keys(storedThemes)[0];
  if (typeof key !== 'string') return;
  theme.set(key);
  if (browser && setStorage) localStorage.setItem('theme', key);
}

function setKey(context : keyof typeof contextKeys) {
  return function (value ?: string) {
    setContext(contextKeys[context], writable(value));
  };
}

function getKey(context : keyof typeof contextKeys) {
  return function () {
    const store = getContext<KeyStore>(contextKeys[context]);
    return store ? get(store) : undefined;
  };
}

function updateKey(context : keyof typeof contextKeys) {
  return function (value ?: string) {
    const store = getContext<KeyStore>(contextKeys[context]);
    if (store) store.set(value);
  };
}

function subscribeKey(
  context : keyof typeof contextKeys,
  callback : (value : string) => void,
) {
  const store = getContext<Writable<string>>(contextKeys[context]);
  if (!store) return () => {};
  const unsubscribe = store.subscribe(callback);
  return unsubscribe;
}

export function getThemeSection(key : string) {
  const themes = getThemes();
  const themeKey = getTheme() ?? 'default';
  const theme = themes[themeKey] ?? themes.default ?? {};
  return getSection(theme, { key });
}

export function getSectionTypography(section : Section, key : string) {
  return section.typography[key]
    ?? section.typography.body
    ?? defaultTheme.typography.default.body;
}

export function getSectionGraphic(section : Section, key : string) {
  return section?.graphics[key];
}

export const setSectionContext = setKey('section');
export const setTypographyContext = setKey('typography');
export const setGraphicContext = setKey('graphic');
export const getSectionContext = getKey('section');
export const getTypographyContext = getKey('typography');
export const getGraphicContext = getKey('graphic');
export const updateSectionContext = updateKey('section');
export const updateTypographyContext = updateKey('typography');
export const updateGraphicContext = updateKey('graphic');

export function onSectionChange(callback : (section ?: string) => void) {
  const unsubscribeTheme = theme.subscribe(() => callback());
  const unsubscribeSection =
    subscribeKey('section', sectionKey => callback(sectionKey));
  return () => { unsubscribeTheme(); unsubscribeSection(); };
}

export function onTypographyChange(callback : (typography ?: string) => void) {
  const unsubscribeSection = onSectionChange(() => callback());
  const unsubscribeTypography =
    subscribeKey('typography', typographyKey => callback(typographyKey));
  return () => { unsubscribeSection(); unsubscribeTypography(); };
}

export function onGraphicChange(callback : (graphic ?: string) => void) {
  const unsubscribeSection = onSectionChange(() => callback());
  const unsubscribeGraphic =
    subscribeKey('graphic', graphicKey => callback(graphicKey));
  return () => { unsubscribeSection(); unsubscribeGraphic(); };
}
