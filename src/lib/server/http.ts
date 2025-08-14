import { log } from './logs';

async function requestResource(url : string, { fetch } : {
  fetch : typeof window.fetch;
}) : Promise<Response | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      log({
        message : `Failed to fetch resource`,
        resource : url,
        response : { status : response.status },
      }, { level : 'warn' });
      return null;
    }
    return response;
  } catch (error) {
    log({
      message : `Error fetching resource`,
      resource : url,
      error,
    }, { level : 'warn' });
    return null;
  }
}

export async function fetchResource(url : string, { fetch } : {
  fetch : typeof window.fetch;
}) : Promise<string | null> {
  const response = await requestResource(url, { fetch });
  if (!response) return null;

  try {
    return await response.text();
  } catch (error) {
    log({
      message : `Error reading response`,
      resource : url,
      response : { status : response.status },
      error,
    }, { level : 'warn' });
    return null;
  }
}

export async function fetchJsonResource<T>(url : string, { fetch } : {
  fetch : typeof window.fetch;
}) : Promise<T | null> {
  const response = await requestResource(url, { fetch });
  if (!response) return null;

  try {
    return await response.json();
  } catch (error) {
    log({
      message : `Error reading JSON response`,
      resource : url,
      response : { status : response.status },
      error,
    }, { level : 'warn' });
    return null;
  }
}
