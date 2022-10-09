
let nodeFetcher = ({ body, ...options }) => {
    const https = require('https');

    return new Promise((resolve,reject) => {
        const req = https.request({
            ...options,
        }, res => {
            const chunks = [];
            res.on('data', data => chunks.push(data))
            res.on('end', () => {
                let resBody = Buffer.concat(chunks);
                switch(res.headers['content-type']) {
                    case 'application/json':
                        resBody = JSON.parse(resBody);
                        break;
                }
                resolve(resBody)
            })
        })
        req.on('error',reject);
        if(body) {
            req.write(body);
        }
        req.end();
    })
}


function httpFetcher({hostname, body, ...options}){
    if(typeof process === 'object')
        return nodeFetcher({hostname, body, ...options});
    else{
        return fetch(hostname, {body, ...options})
    }
}

module.exports = httpFetcher
