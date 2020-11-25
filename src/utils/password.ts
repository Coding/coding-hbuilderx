import crypto from 'crypto';

export const encryptPassword = (pwd: string, encryptMethod = 'sha1') => {
  const md5 = crypto.createHash(encryptMethod);
  const result = md5.update(pwd).digest('base64');
  return result;
};
