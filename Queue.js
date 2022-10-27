module.exports = {
  async craeteQueue({ queueKey, queueType }) {
    const createObj = this.getCreateObj({ queueKey, queueType });
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
  },

  getCreateObj({ queueKey, queueType }) {
    const createObj = {};
    createObj.queueKey = queueKey;
    createObj.queueType = queueType;
    return createObj;
  },
};
