const https = require('https');

doRequest = async (options) => {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            res.setEncoding('utf8');
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                try {
                    var rb = JSON.parse(responseBody);
                    resolve(rb);
                    
                } catch (e) {
                    resolve(responseBody);
                    
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
};

module.exports.doRequest = doRequest;