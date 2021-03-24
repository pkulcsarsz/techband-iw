const https = require('https');

doRequest = async (options, data = null) => {
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
            console.log("error during async request", err);
            reject(err);
        });

        if ((options.method == 'PUT' || options.method == 'POST') && data != null) {
            req.write(data);
        }

        req.end();
    });
};

module.exports.doRequest = doRequest;