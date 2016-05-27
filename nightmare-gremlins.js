'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.recordErrors = recordErrors;
exports.injectGremlins = injectGremlins;
exports.createHorde = createHorde;
exports.seedHorde = seedHorde;
exports.unleashHorde = unleashHorde;
exports.waitForGremlins = waitForGremlins;
exports.unleashGremlins = unleashGremlins;
exports.default = task;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
  wait: {
    maxErrors: 100,
    maxTime: 10 * 1000
  }
};

function recordErrors(errors) {
  return function executeRecordErrors(nightmare) {
    nightmare.on('page', function () {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'error' : arguments[0];
      var message = arguments[1];
      var stack = arguments[2];

      if (type !== 'error') return;
      errors.push({ message: message, stack: stack });
    });
  };
}

function injectGremlins() {
  return function executeInjectGremlins(nightmare) {
    nightmare.inject('js', _path2.default.join(__dirname, 'gremlins.min.js'));
  };
}

function createHorde() {
  return function executeCreateHorde(nightmare) {
    nightmare.evaluate(function () {
      window.horde = window.gremlins.createHorde();
    });
  };
}

function seedHorde() {
  var seed = arguments.length <= 0 || arguments[0] === undefined ? Date.now() : arguments[0];

  return function executeSeedHorde(nightmare) {
    nightmare.evaluate(function (seedNum) {
      window.horde.seed(seedNum);
    }, seed);
  };
}

function unleashHorde() {
  var _options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var options = (0, _assign2.default)({}, defaults.unleash, _options);

  return function executeUnleashHorde(nightmare) {
    nightmare.evaluate(function (jsonOptions) {
      window.horde.unleash(JSON.parse(jsonOptions));
    }, (0, _stringify2.default)(options));
  };
}

function waitForGremlins(errors) {
  var _options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var options = (0, _assign2.default)({}, defaults.wait, _options);

  return function executeWaitForGremlins(nightmare) {
    var start = Date.now();

    nightmare.wait(function (errorsLength, startTime, maxErrors, maxTime) {
      return Date.now() - startTime > maxTime || errorsLength >= maxErrors;
    }, errors.length, start, options.maxErrors, options.maxTime);
  };
}

function unleashGremlins() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  // eslint-disable-next-line no-param-reassign
  options.seed = options.seed || Date.now();
  var errors = [];

  return function executeUnleashGremlins(nightmare) {
    nightmare.use(recordErrors(errors)).use(injectGremlins()).use(createHorde(options.create)).use(seedHorde(options.seed)).use(unleashHorde(options.unleash)).use(waitForGremlins(errors, options.wait)).queue(function (done) {
      return done(null, errors);
    });
  };
}

function task() {
  var _options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  // eslint-disable-next-line no-param-reassign
  return function executeTask(done, _runOptions) {
    var options = (0, _assign2.default)({}, _options, _runOptions);

    this.use(unleashGremlins(options)).then(done.bind(null, null));
  };
}