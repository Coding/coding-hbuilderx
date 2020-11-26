export const getEmailPrefix = (email: string) => {
  const matchRes = email.match(/([^@]+)@/);
  return matchRes?.[1];
};
