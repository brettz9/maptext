/* eslint-disable no-console, import/no-dynamic-require */

const util = require('util');
const assert = require('assert');
const {join} = require('path');
const {writeFile: writeFileAsync} = require('fs');
const {randomBytes: randomBytesAsync, pbkdf2: pbkdf2Async} = require('crypto');

const adminJSONPath = './maptext-admin.json';
const adminJSON = require(adminJSONPath);

const [, , user, pass, roles] = process.argv;
const randomBytes = util.promisify(randomBytesAsync);
const pbkdf2 = util.promisify(pbkdf2Async);
const writeFile = util.promisify(writeFileAsync);

const iterations = 100000;
const keylen = 64;
const digest = 'sha512';

if (adminJSON.users.some((u) => u.id === user)) {
  throw new Error(`User, ${user}, already exists`);
}

(async () => {
const salt = (await randomBytes(256)).toString('hex');

const hash = (
  await pbkdf2(pass, salt, iterations, keylen, digest)
).toString('hex');

assert.ok(
  hash === (
    await pbkdf2(pass, salt, iterations, keylen, digest)
  ).toString('hex')
);
adminJSON.users.push({
  id: user,
  roles: roles ? roles.split(',') : null,
  pass: {hash, salt}
});
const data = JSON.stringify(adminJSON, null, 2);
console.log('Writing adminJSON...', data);
await writeFile(join(__dirname, adminJSONPath), data, 'utf8');
console.log('Finished!');
})();
