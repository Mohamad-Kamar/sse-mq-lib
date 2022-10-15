const fetch = require('cross-fetch');

class Producer{
    constructor(url, queueKey='', queueType=null){
        this.url = url;
        this.queueKey = '';
        this.queueType = null;
    }

    publish({queueKey, queueType, message}){
        this._setParams({queueKey, queueType})
        let createObj = this._getCreateObj();
        let messageObj = this._getMessageObj(createObj);
        let r = fetch({
            hostname: `${this.url}/producer`,
            method: 'POST',
            body: JSON.stringify(messageObj),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return true;
    }

    async craete({queueKey, queueType}){
        this._resetParams({queueKey, queueType});

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

    _getCreateObj(){
        let createObj = {};
        if(this.queueKey) createObj.queueKey = this.queueKey;
        if(this.queueType) createObj.queueType = this.queueType;
        return createObj;
    }
    _getMessageObj(createObj){
        return {...createObj, message}
    }

    _resetParams({queueKey, queueType}){
        queueKey ? this.queueKey = queueKey: this.queueKey = uid();
        queueType ? this.queueType = queueType: this.queueType = null;
    }
    _setParams({queueKey, queueType}){
        if(queueKey) this.queueKey = queueKey;
        if(queueType) this.queueType = queueType;
    }
}

module.exports = Producer
