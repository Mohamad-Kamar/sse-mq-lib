const fetch = require('cross-fetch');
const { InvalidQueueErrors } = require('./ErrorsTypes');

class Consumer {
  constructor(url) {
    this.url = url;
    this.queueKey = '';
    this.queueType = null;
    this.event = null;
    this.consumerID = null;
  }

  async connect({
    queueKey, consumerID, onmessage, onerror,
  }) {
    await this.resetConnection({ queueKey, consumerID });
    const connectObj = this.getCreateObj();
    const connectionSearchParamsString = new URLSearchParams(connectObj).toString();
    const urlWithParams = `${this.url}/consumer/connect?${connectionSearchParamsString}`;
    const event = new EventSource(urlWithParams);
    this.event = event;
    this.event.onmessage = onmessage;
    this.event.onerror = onerror;
  }

  setOnMessage(onmessage) {
    this.event.onmessage = onmessage;
  }

  setOnerror(onerror) {
    this.event.onerror = onerror;
  }

  async craete({ queueKey, queueType }) {
    this.resetConnection({ queueKey, queueType });

    const createObj = this.getCreateObj();
    const r = fetch({
      hostname: `${this.url}/queue`,
      method: 'POST',
      body: JSON.stringify(createObj),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const jsonedResults = await r.json();
    return jsonedResults.connectionParams;
  }

  getCreateObj() {
    const createObj = {};
    if (this.queueKey) createObj.queueKey = this.queueKey;
    if (this.consumerID) createObj.consumerID = this.consumerID;
    return createObj;
  }

  async resetConnection({ queueKey, consumerID }) {
    if (!queueKey) throw new InvalidQueueErrors();

    this.resetEvent();
    this.queueKey = queueKey;
    if (!consumerID) this.consumerID = await this.queueInstance.createQueue();

    return this.consumerID;
  }

  resetEvent() {
    if (this.event) this.event.close();
    this.event = null;
  }
}

module.exports = Consumer;
