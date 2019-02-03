const request = require('request');

exports.run = (name) => {
  const options = {
    url: `https://api.github.com/users/${name}`,
    headers: {
      'User-Agent': 'request',
    },
  };
  return new Promise(((resolve, reject) => {
    request.get(options, (err, resp, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    });
  }));
};
