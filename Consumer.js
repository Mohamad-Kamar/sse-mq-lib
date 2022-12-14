const fetch = require('cross-fetch');
const EventSource = require('eventsource');
const { InvalidQueueErrors } = require('./ErrorsTypes');

class Consumer {
  constructor(url, {
    queueKey, consumerID,
  } = {}) {
    this.url = url;
    this.queueKey = queueKey;
    this.consumerID = consumerID;
  }

  async connect({
    queueKey, consumerID,
  } = {}) {
    this.setConnectionParams({ queueKey, consumerID });
    if (!this.queueKey) throw new InvalidQueueErrors();

    this.consumerID = await this.createConsumer();
    const connectObj = this.getCreateObj();
    const connectionSearchParamsString = new URLSearchParams(connectObj).toString();
    const urlWithParams = `${this.url}/consumer/connect?${connectionSearchParamsString}`;
    const event = new EventSource(urlWithParams);
    this.event = event;
  }

  async createConsumer() {
    const targetUrl = `${this.url}/consumer/create`;
    const creatingBody = { queueKey: this.queueKey };
    if (this.consumerID) creatingBody.consumerID = this.consumerID;
    const createEndpointResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(creatingBody),
    });
    const consumerID = await createEndpointResponse.text();
    return consumerID;
  }

  setConnectionParams({ queueKey, consumerID } = {}) {
    if (queueKey) this.queueKey = queueKey;
    if (consumerID) this.consumerID = consumerID;
  }

  setOnMessage(onmessage) {
    this.event.onmessage = onmessage;
  }

  setOnOpen(onopen) {
    this.event.onopen = onopen;
  }

  setOnError(onerror) {
    this.event.onerror = onerror;
  }

  getCreateObj() {
    const createObj = {};
    if (this.queueKey) createObj.queueKey = this.queueKey;
    if (this.consumerID) createObj.consumerID = this.consumerID;
    return createObj;
  }
}

module.exports = Consumer;
