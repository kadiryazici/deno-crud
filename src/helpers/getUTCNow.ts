/**
 * @description This function used to return UTC Timestamp instead of local one.

 * @example
 * ```ts
 * // To get local Timestamp from UTC Timestamp following example can be used
 * export function getLocalNow(utcNow: number) {
 *    const date = new Date();
 *    return utcNow + date.getTimezoneOffset() * 60 * 1000 * -1;
 * }
 * ```
 * @returns UTC Timestamp
 */
export function getUTCNow() {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset();
  return Date.now() + timezoneOffset * 60 * 1000;
}
