import crypto from 'crypto';

export const encryptPassword = (pwd: string, encryptMethod = 'sha1') => {
  const method = crypto.createHash(encryptMethod);
  const result = method.update(pwd).digest('hex');
  return result;
};
