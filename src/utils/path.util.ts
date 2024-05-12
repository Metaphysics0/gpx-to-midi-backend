export const appendCwdToPath = (path: string): string =>
  process.cwd() + (path.startsWith('/') ? path : path.substring(1));
