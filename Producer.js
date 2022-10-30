const fetch = require('cross-fetch');

class Producer {
  constructor(url, { queueKey } = {}) {
    this.url = url;
    this.queueKey = queueKey;
  }

  async publish(message, { queueKey } = {}) {
    this.setParams({ queueKey });
    const messageObj = this.getCreateMessageObj(message);
    const results = await fetch({
      hostname: `${this.url}/producer`,
      method: 'POST',
      body: JSON.stringify(messageObj),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return results.status === 201;
  }

  getCreateMessageObj(message) {
    const createObj = {};
    if (this.queueKey) createObj.queueKey = this.queueKey;
    createObj.message = message;
    return createObj;
  }

  setParams({ queueKey } = {}) {
    if (queueKey) this.queueKey = queueKey;
  }
}

module.exports = Producer;
