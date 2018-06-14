const assert = require('assert');
const app = require('../../src/app');

describe('\'words\' service', () => {
  it('registered the service', () => {
    const service = app.service('words');

    assert.ok(service, 'Registered the service');
  });
});
