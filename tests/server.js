var expect  = require('chai').expect;
var request = require('request');

describe('Calculator API', function() {

    describe('Addition', function() {
        this.timeout(25000);
        var url = 'http://localhost:3000/add?arg1=1&arg2=2';

        it('returns status 200', function() {
            request(url, function(error, response, body) {
                console.log('response.statusCode',response.statusCode);
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
  
        it('returns two arguments added together', function() {
            request(url, function(error, response, body) {
                console.log('body',body);
                expect(body).to.equal('2');
                done();
            });
        });
    });
});