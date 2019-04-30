// THIS MIDDLEWARE DOES NO AUTHENTICATION!!!!
'use strict';
module.exports = function (prefix) {
  return function (req, res, next) {
    if (req.method === 'PUT') {
      const _end = res.end;
      res.end = function (data) {
        _end.call(res, prefix + data);
      };

      /* eslint-disable no-console */
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        console.log('No more data in response.');
      });
      /* eslint-enable no-console */
    }
    next();
  };
};
