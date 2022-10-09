const fetch = require('cross-fetch');

const uid = () => String(Date.now().toString(32) + Math.random().toString(16)).replace(/\./g, '');

class Consumer {
    constructor(url) {
        this.url = url;
        this.queueName = '';
        this.queueType = null;
        this.event = null;
    }

    connect({ queueName, queueType }) {
        this._resetParams({ queueName, queueType });
        let connectObj = this._getCreateObj();
        let connectionSearchParamsString = new URLSearchParams(connectObj).toString();
        let urlWithParams = `${this.url}/consumer/connect?${connectionSearchParamsString}`;
        let event = new EventSource(urlWithParams);
        this.event = event;
        this.event.onmessage = this.onmessage;
        this.event.onerror = this.onerror;
    }

    onmessage(message) {
        console.log(message);
    }
    setOnMessage(onmessage) {
       this.event.onmessage = onmessage;
    }
    onerror(message) {
        console.error(message);
    }
    setOnerror(onerror) {
        this.event.onerror = onerror;
    }

    async craete({ queueName, queueType }) {
        this._resetParams({ queueName, queueType });

        let createObj = this._getCreateObj();
        let r = fetch({
            hostname: `${this.url}/queue`,
            method: 'POST',
            body: JSON.stringify(createObj),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        let jsonedResults = await r.json();
        return jsonedResults.connectionParams;
    }

    _getCreateObj() {
        let createObj = {};
        if(this.queueName) createObj.queueName = this.queueName;
        if(this.queueType) createObj.queueType = this.queueType;
        return createObj;
    }

    _resetParams({ queueName, queueType }) {
        this._resetEvent();

        queueName ? this.queueName = queueName : this.queueName = uid();
        queueType ? this.queueType = queueType : this.queueType = null;
    }

    _resetEvent() {
        this.event && this.event.close();
        this.event = null;
    }
}

module.exports = Consumer

