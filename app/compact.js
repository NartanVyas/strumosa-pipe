exports.run = (name, request) => {
  const options = {
    url: 'https://api.github.com/users/'+name,
    headers: {
      'User-Agent': 'request',
    },
  };
  return new Promise(((resolve, reject) => {
      console.log('options',options);
        request.get(options.toString(), (err, resp, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(body));
            }
        })
  }));
};
