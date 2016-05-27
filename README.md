# Nightmare Gremlins
[Gremlin.js](https://github.com/marmelab/gremlins.js) actions for [Nightmare.js](https://github.com/segmentio/nightmare) to allow for monkey testing

## Introduction
Nightmare Gremlins is an action and collection of tasks for Nightmare.js that allows for monkey testing via the [Electron](http://electron.atom.io/) app.

There are two ways to use this npm: 

1) Singular action that extends the Nightmare prototype via `Nightmare.action`

2) Series of individual tasks to be consumed by a Nightmare instance via `nightmare.use`.

## Singular Action

The Nightmare prototype can be extended by using the [`Nightmare.action`](https://github.com/segmentio/nightmare#extending-nightmare) method:

```js
import Nightmare from 'nightmare';
import gremlins from 'nightmare-gremlins';

Nightmare.action('gremlins', gremlins);
const nightmare = Nightmare();

const gremlinOptions = {
  seed: Date.now(),
  unleash: {
    nb: 10000,
  },
  wait: {
    maxErrors: 100,
    maxTime: 10 * 1000,
  },
};

nightmare
  .goto('https://google.com')
  .gremlins(gremlinOptions) // Run gremlins on the page
  .then((errors) => { console.log('Page errors:\n', errors); });

```

## Series of tasks

Alternatively, Nightmare Gremlins also exposes a series of individual functions that can be used on an instance of Nightmare for custom composing via [`.use`](https://github.com/segmentio/nightmare#useplugin):

```js
import Nightmare from 'nightmare';
import * as gremlins from 'nightmare-gremlins';

Nightmare.action('gremlins', gremlins);
const nightmare = Nightmare();

const gremlinOptions = {
  seed: Date.now(),
  unleash: {
    nb: 10000,
  },
  wait: {
    maxErrors: 100,
    maxTime: 10 * 1000,
  },
};

const errors = [];

nightmare
  .use(gremlins.recordErrors(errors))
  .use(gremlins.injectGremlins())
  .use(gremlins.createHorde())
  .use(gremlins.seedHorde(gremlinOptions.seed))
  .use(gremlins.unleashHorde(gremlinOptions.unleash))
  .use(gremlins.waitForGremlins(errors, gremlinOptions.wait))
  .then((errors) => { console.log('Page errors:\n', errors); });
```

By using a series of tasks, it is possible to add individual steps or functionality:

```js
...

const errors = [];

nightmare
  .use(gremlins.recordErrors(errors))
  .use(gremlins.injectGremlins())
  .evaluate((seed) => {
    const horde = window.gremlins.createHorde();
    horde.seed(seed);
    horde.unleash();
  }, Date.now())
  .use(gremlins.waitForGremlins(errors, gremlinOptions.wait))
  .then(() => { console.log('Page errors:\n', errors); });
```

### Available Actions

Nightmare Gremlins exposes the following tasks (with **arguments** and *defaults*):

* recordErrors(**Array** - *[]*) - adds a listener to the page that will look for all errors and push the error message and stack onto the array passed in
* injectGremlins - injects a specially modified version of the gremlins.js script that supports keyboard entry on Electron
* createHorde - runs a script on the page that creates a horde under the `window.horde` namespace
* seedHorde(**Number|String** - *Date.now()*) - [seeds the horde](https://github.com/marmelab/gremlins.js/blob/master/README.md#seeding-the-randomizer) with a specific number to allow for behavior replication
* unleashHorde(**Object** - *{}*) - runs a script on the page that unleashes the horde with the [options](https://github.com/marmelab/gremlins.js#basic-usage) argument having been JSON serialized and deserialized to be passed to the browser
* waitForGremlins(**Object** - *{maxTime: 10000, maxErrors: 100}*) - a waiting function that looks for 1 of 2 conditions to be met: time passed is longer than `maxTime` or the number of errors recorded is greater than `maxErrors`

### Bonus Action

Nightmare Gremlins includes an additional "super task", that is the same as the action used to extend the Nightmare prototype, but intended to be used on an instance instead:

```js
import Nightmare from 'nightmare';
import {unleashGremlins} from 'nightmare-gremlins';

const nightmare = Nightmare();

const gremlinOptions = {
  seed: Date.now(),
  unleash: {
    nb: 10000,
  },
  wait: {
    maxErrors: 100,
    maxTime: 10 * 1000,
  },
};

nightmare
  .use(unleashGremlins(gremlinOptions))
  .then((errors) => { console.log('Page errors:\n', errors); });
```