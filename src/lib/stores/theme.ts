import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';

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
