import chai from 'chai';
import Nightmare from 'nightmare';
import gremlins from '../nightmare-gremlins';

const expect = chai.expect;

Nightmare.action('gremlins', gremlins());
const nightmare = Nightmare({
  openDevTools: false,
  show: true,
  switches: { 'ignore-certificate-errors': true },
});

describe('google.com', () => {
  it('should have no errors', (done) => {
    nightmare
      .goto('https://google.com')
      .gremlins()
      .then((errors) => {
        expect(errors).to.have.length(0);
        done();
      });
  });
});
