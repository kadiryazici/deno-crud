import * as path from 'path';

export function getRoot() {
  const isDev = Deno.env.get('MODE') === 'dev';
  if (isDev) return Deno.cwd();
  return path.dirname(Deno.execPath());
}
