const fetch = require('cross-fetch');

class Producer{
    constructor(url, queueName='', queueType=null){
        this.url = url;
        this.queueName = '';
        this.queueType = null;
    }

    publish({queueName, queueType, message}){
        this._setParams({queueName, queueType})
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

    async craete({queueName, queueType}){
        this._resetParams({queueName, queueType});

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
        if(this.queueName) createObj.queueName = this.queueName;
        if(this.queueType) createObj.queueType = this.queueType;
        return createObj;
    }
    _getMessageObj(createObj){
        return {...createObj, message}
    }

    _resetParams({queueName, queueType}){
        queueName ? this.queueName = queueName: this.queueName = uid();
        queueType ? this.queueType = queueType: this.queueType = null;
    }
    _setParams({queueName, queueType}){
        if(queueName) this.queueName = queueName;
        if(queueType) this.queueType = queueType;
    }
}

module.exports = Producer
