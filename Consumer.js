const fetch = require('cross-fetch');
const { InvalidQueueErrors } = require('./ErrorsTypes');

class Consumer {
  constructor(url, {
    queueKey, consumerID,
  }) {
    this.url = url;
    this.queueKey = queueKey;
    this.consumerID = consumerID;
  }

  async connect({
    queueKey, consumerID,
  }) {
    this.setConnectionParams({ queueKey, consumerID });
    if (!queueKey && !this.queueKey) throw new InvalidQueueErrors();

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
      body: { ...creatingBody },
    });
    const consumerID = createEndpointResponse.text();
    return consumerID;
  }

  setConnectionParams({ queueKey, consumerID }) {
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
