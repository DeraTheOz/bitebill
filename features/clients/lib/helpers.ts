/** Returns the first 8 characters of a client UUID for compact UI display. */
export function shortClientId(clientId: string) {
  return clientId.slice(0, 8);
}
