var server = require('../server/index.js');
const request = require('supertest');
const manualController = require('../server/db/dbController');
const assert = require('assert');

let baseUrl = '/';

describe('Server endpoints', function() {

  // Auth Endpoint tests start ------------
  describe('/auth endpoint', function() {

    baseUrl += 'auth';
    after(function() {
      baseUrl = baseUrl.slice(0, -'auth'.length);
      manualController.deleteUserRaw('test@test.com', () => {});
    });

    describe('/auth/signup', function() {

      before(function() {
        baseUrl += '/signup';
        manualController.deleteUserRaw('test@test.com', () => {});
      });

      after(function() {
        baseUrl = baseUrl.slice(0, -'/signup'.length)
      });

      it('should create a new user in the database', function(done) {
        request(server)
          .post(baseUrl)
          .type('json')
          .send(JSON.stringify({email: 'test@test.com', password: 'cool'}))
          .expect(200, done);
      });
      it('should not allow for duplicate users', function(done) {
          request(server)
            .post(baseUrl)
            .type('json')
            .send(JSON.stringify({email: 'test@test.com', password: 'differentcoolpassword'}))
            .expect(409, done);
      });
    });
  
    //Login tests;

    describe('/auth/login', function() {

      before(function() {
        baseUrl += '/login';
        manualController.newUser('test@testmail.com', 'testy', () => {})
      });

      after(function() {
        baseUrl = baseUrl.slice(0, -'/login'.length);
      });

      it('should return 202 if a user used correct email and password', function(done) {
        request(server)
              .post(baseUrl)
              .type('json')
              .send(JSON.stringify({email: 'test@testmail.com', password: 'testy'}))
              .expect((res) => {
                // console.log(res.user);
                assert(Boolean(res.headers['set-cookie']), true);
              })
              .expect(202, done);
      });

      it('should return 401 if a user used incorrect password', function(done) {
        request(server)
              .post(baseUrl)
              .type('json')
              .send(JSON.stringify({email: 'test@testmail.com', password: 'tasty'}))
              .expect(401, done);
      });
      it('should return 401 if a user used incorrect username', function(done) {
        request(server)
              .post(baseUrl)
              .type('json')
              .send(JSON.stringify({email: 'toast@testmail.com', password: 'testy'}))
              .expect(401, done);
      });
    });

    after(function(done) {
      server.close(done);
    });

    //AUTH ENDPOINT TESTS END-------------------
  });
});
