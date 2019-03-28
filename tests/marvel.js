const expect = require('chai').use(require('chai-as-promised'));
const request = require('request');

describe('Marvel API', () => {
  describe('GET', () => {
    const url = 'http://localhost:3000/marvel?limit=10&name=characters&offset=0';

    it('returns status 200', () => {
      request(url, (error, response, body) => {
        console.log('response.statusCode', response.statusCode);
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('returns 10 super heroes', () => {
      request(url, (error, response, body) => {
        console.log('body', body);
        expect(body).to.equal('21');
        done();
      });
    });
  });
});
