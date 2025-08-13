export function log(
  entry : unknown,
  options : {
    level ?: 'info' | 'warn' | 'error';
  } = {},
) {
  const { level = 'info' } = options;
  const logger = (level === 'info') ? console.log : console[level];

  if (entry && (typeof entry === 'object') && ('message' in entry)) {
    const { message, ...rest } = entry;
    entry = [message, ...(Object.keys(rest).length ? [rest] : [])];
  }

  if (Array.isArray(entry)) logger(...entry);
  else logger(entry);
}
