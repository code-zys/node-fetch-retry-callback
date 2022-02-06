'use strict'

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (url, opts) => {
    let retry = opts && opts.retry || 3
    const initialRetry = retry
    const accepted = opts && opts.accepted || [200]
    const factor = opts && opts.factor || 1
    let pause = opts && opts.pause || 1000
    const verbose = opts && opts.verbose

/*
    if(retry<=0)
    {
        const response = await fetch(url, opts)
        return response;
    }
*/
    while (retry >= 0) {
        try {
            const responseRetry =  await fetch(url, opts)
            if(accepted.indexOf(responseRetry.status) > -1)
            {
                return responseRetry
            }
            var err = new Error('Status not accepted')
            err.status = responseRetry.status
            err.statusText = responseRetry.statusText
            throw err

        } catch(e) {

            if (retry === 0) {
                throw e
            }
            retry = retry - 1
            if (opts && opts.callback) {
                opts.callback(initialRetry-retry, e)
            }

            if (pause >= 0) {
                if (verbose) console.log("pausing..");
                await sleep(pause);
                if (verbose) console.log("done pausing...");
            }
            pause = pause * factor
        }
    }
};


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
