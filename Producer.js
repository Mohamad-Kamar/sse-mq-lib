const fetch = require("cross-fetch");

class Producer {
  constructor(url, { queueKey, durable } = {}) {
    this.url = url;
    this.queueKey = queueKey;
  }

  async publish(message, { queueKey, durable } = {}) {
    this.setParams({ queueKey });
    const messageObj = this.getCreateMessageObj(message, { queueKey, durable });
    const results = await fetch(`${this.url}/producer`, {
      method: "POST",
      body: JSON.stringify(messageObj),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return results.status === 201;
  }

  getCreateMessageObj(message, { queueKey, durable } = {}) {
    const createObj = {};
    if (queueKey) createObj.queueKey = queueKey;
    else if (this.queueKey) createObj.queueKey = this.queueKey;

    if (durable) createObj.durable = durable;
    else createObj.durable = false;
    createObj.message = message;
    return createObj;
  }

  setParams({ queueKey } = {}) {
    if (queueKey) this.queueKey = queueKey;
  }
}

module.exports = Producer;
