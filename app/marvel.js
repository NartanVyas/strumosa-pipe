const request = require('request');
const crypto = require('crypto');
const endpoint = 'https://gateway.marvel.com/';
const public_key = '6accae70cb2b1d662586fc171fa02ef0';
const private_key = '1836e35af75982bd073ba508061cedc46c431f25';

exports.run = (name) => {
  const ts = new Date().getTime(); // a timestamp (or other long string which can change on a request-by-request basis)
  const ts_private_public = ts + private_key + public_key;
  const hash = crypto.createHash('md5').update(ts_private_public).digest('hex');
  const testAPI = endpoint+`/v1/public/characters?apikey=${public_key}&ts=${ts}&hash=${hash}`;

  const options = {
    url: testAPI,
    headers: {
      'User-Agent': 'request',
      'Accept': '*/*'
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
