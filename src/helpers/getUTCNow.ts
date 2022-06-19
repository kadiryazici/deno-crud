export function getUTCNow() {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset();
  return Date.now() + timezoneOffset * 60 * 1000;
}

export function getLocalNow(utcNow: number) {
  const date = new Date();
  return utcNow + date.getTimezoneOffset() * 60 * 1000 * -1;
}
