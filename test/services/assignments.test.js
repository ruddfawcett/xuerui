const assert = require('assert');
const app = require('../../src/app');

describe('\'assignments\' service', () => {
  it('registered the service', () => {
    const service = app.service('assignments');

    assert.ok(service, 'Registered the service');
  });
});
