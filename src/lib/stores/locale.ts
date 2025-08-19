import { get, writable } from 'svelte/store';

import { buildLocale } from '$lib/utils/locale';

let locale = writable<unknown>();

export function resetLocale() {
  locale = writable<unknown>();
}

export function setLocale(newLocale : unknown) {
  locale.set(buildLocale(newLocale));
}

export function getLocale() {
  return buildLocale(get(locale));
}
