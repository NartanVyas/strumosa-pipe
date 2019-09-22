const request = require('request');
const curator = require('art-curator');

exports.run = (lang, cat, wdt, wd) => {
  console.log('cat', cat);
  const wikiUrl = curator.createWikiDataCategoryUrl(lang, cat, wdt, wd);
  const options = {
    url: wikiUrl,
    headers: {
      'User-Agent': 'request',
      Accept: '*/*',
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
