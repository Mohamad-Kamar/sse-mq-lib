const fetch = require('cross-fetch');

class Queue {
  static async craeteQueue({ url, queueKey, queueType }) {
    const createObj = Queue.getCreateObj({ queueKey, queueType });
    const r = fetch({
      hostname: `${url}/queue`,
      method: 'POST',
      body: JSON.stringify(createObj),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const jsonedResults = await r.json();
    return jsonedResults.connectionParams;
  }

  static getCreateObj({ queueKey, queueType }) {
    const createObj = {};
    createObj.queueKey = queueKey;
    createObj.queueType = queueType;
    return createObj;
  }
}
module.exports = Queue;
