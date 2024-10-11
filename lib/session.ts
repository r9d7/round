// User session mock
export function getSession() {
  return {
    user: { id: "0", email: "john.doe@email.com", name: "John Doe" },
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
  };
}
