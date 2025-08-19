import { fetchJsonResource } from './http';

export async function loadLocale(
  { fetch } : { fetch : typeof window.fetch; },
) {
  return (await fetchJsonResource('/locale.json', { fetch })) ?? {};
}
