import path from 'path';

const defaults = {
  wait: {
    maxErrors: 100,
    maxTime: 10 * 1000,
  },
};

export function recordErrors(errors) {
  return function executeRecordErrors(nightmare) {
    nightmare.on('page', (type = 'error', message, stack) => {
      if (type !== 'error') return;
      errors.push({ message, stack });
    });
  };
}

export function injectGremlins() {
  return function executeInjectGremlins(nightmare) {
    nightmare.inject('js', path.join(__dirname, 'gremlins.min.js'));
  };
}

export function createHorde() {
  return function executeCreateHorde(nightmare) {
    nightmare.evaluate(() => {
      window.horde = window.gremlins.createHorde();
    });
  };
}

export function seedHorde(seed = Date.now()) {
  return function executeSeedHorde(nightmare) {
    nightmare.evaluate((seedNum) => {
      window.horde.seed(seedNum);
    }, seed);
  };
}

export function unleashHorde(_options = {}) {
  const options = Object.assign({}, defaults.unleash, _options);

  return function executeUnleashHorde(nightmare) {
    nightmare.evaluate((jsonOptions) => {
      window.horde.unleash(JSON.parse(jsonOptions));
    }, JSON.stringify(options));
  };
}

export function waitForGremlins(errors, _options = {}) {
  const options = Object.assign({}, defaults.wait, _options);

  return function executeWaitForGremlins(nightmare) {
    const start = Date.now();

    nightmare.wait(
      (errorsLength, startTime, maxErrors, maxTime) => (
        (Date.now() - startTime) > maxTime || errorsLength >= maxErrors
      ),
      errors.length,
      start,
      options.maxErrors,
      options.maxTime
    );
  };
}

export function unleashGremlins(options = {}) {
  // eslint-disable-next-line no-param-reassign
  options.seed = options.seed || Date.now();
  const errors = [];

  return function executeUnleashGremlins(nightmare) {
    nightmare
      .use(recordErrors(errors))
      .use(injectGremlins())
      .use(createHorde(options.create))
      .use(seedHorde(options.seed))
      .use(unleashHorde(options.unleash))
      .use(waitForGremlins(errors, options.wait))
      .queue((done) => done(null, errors));
  };
}

export default function task(_options = {}) {
  // eslint-disable-next-line no-param-reassign
  return function executeTask(done, _runOptions) {
    const options = Object.assign({}, _options, _runOptions);

    this
      .use(unleashGremlins(options))
      .then(done.bind(null, null));
  };
}
