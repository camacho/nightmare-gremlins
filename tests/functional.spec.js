'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _nightmare = require('nightmare');

var _nightmare2 = _interopRequireDefault(_nightmare);

var _nightmareGremlins = require('../nightmare-gremlins');

var _nightmareGremlins2 = _interopRequireDefault(_nightmareGremlins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _chai2.default.expect;

_nightmare2.default.action('gremlins', (0, _nightmareGremlins2.default)());
var nightmare = (0, _nightmare2.default)({
  openDevTools: false,
  show: true,
  switches: { 'ignore-certificate-errors': true }
});

describe('google.com', function () {
  it('should have no errors', function (done) {
    nightmare.goto('https://google.com').gremlins().then(function (errors) {
      expect(errors).to.have.length(0);
      done();
    });
  });
});