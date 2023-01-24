const fetch = require('cross-fetch');
const EventSource = require('eventsource');
const { InvalidQueueErrors } = require('./ErrorsTypes');

class Consumer {
  constructor(url, { queueKey, consumerID } = {}) {
    this.url = url;
    this.queueKey = queueKey;
    this.consumerID = consumerID;
  }

  async connect({ queueKey, consumerID } = {}) {
    this.setConnectionParams({ queueKey, consumerID });
    if (!this.queueKey) throw new InvalidQueueErrors();

    this.consumerID = await this.createConsumer();
    const connectObj = this.getCreateObj();
    const connectionSearchParamsString = new URLSearchParams(
      connectObj,
    ).toString();
    const urlWithParams = `${this.url}/consumer/connect?${connectionSearchParamsString}`;
    const event = new EventSource(urlWithParams);
    this.event = event;
  }

  async createConsumer({ queueKey, consumerID } = {}) {
    const targetUrl = `${this.url}/consumer`;
    const creatingBody = this.getConnectionParams({ queueKey, consumerID });
    if (this.consumerID) creatingBody.consumerID = this.consumerID;
    const createEndpointResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(creatingBody),
    });
    const consumerDetails = await createEndpointResponse.json();
    const receivedConsumerID = consumerDetails.consumerID;
    return receivedConsumerID;
  }

  getConnectionParams({ queueKey, consumerID }) {
    return {
      queueKey: queueKey || this.queueKey,
      consumerID: consumerID || this.consumerID,
    };
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

  delete() {
    this.event.close();
    fetch(`${this.url}/consumer/?queueKey=${this.queueKey}&consumerID=${this.consumerID}`, {
      method: 'DELETE',
    });
  }
}

module.exports = Consumer;
