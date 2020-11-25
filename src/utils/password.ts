import crypto from 'crypto';

export const password = (pwd: string) => {
  const md5 = crypto.createHash('sha1');
  const result = md5.update(pwd).digest('base64');
  return result;
};
