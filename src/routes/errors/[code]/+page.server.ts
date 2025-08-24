import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const _messages : Record<string, string> & { default : string; } = {
  default : 'Unknown Error',
  400 : 'Bad Request',
  401 : 'Unauthorized',
  403 : 'Forbidden',
  404 : 'Not Found',
  500 : 'Internal Server Error',
};

export const load : PageServerLoad = async ({ params }) => {
  const { code } = params;
  let status = Number(code);
  if (isNaN(status)) status = 400;
  if (status < 400 || status > 599) status = 500;
  throw error(status, { message : _messages[status] || _messages.default });
};
