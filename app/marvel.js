const request = require('request');
const crypto = require('crypto');
const endpoint = 'https://gateway.marvel.com/';

require('dotenv').config();
const public_key = process.env.PUBLIC_KEY;
const private_key = process.env.PRIVATE_KEY;

exports.run = (name, offset, limit) => {
  console.log('Limit',limit);
  const ts = new Date().getTime();
  const ts_private_public = ts + private_key + public_key;
  const hash = crypto.createHash('md5')
    .update(ts_private_public)
    .digest('hex');
  const testAPI = endpoint+`/v1/public/characters?apikey=${public_key}&ts=${ts}&hash=${hash}&offset=${offset}&limit=`+limit;
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
