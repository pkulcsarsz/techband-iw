const CONFIG = require('../config');
const { EventEmitter } = require('events');
const { doRequest } = require('./requester');

const eventEmitter = new EventEmitter();

const trackedProperties = ["subject"];

let lastUpdateAt = null;

startSynchronization = () => {
    setInterval(async () => {
        await synchronie();
    }, CONFIG.SYNC_TIMEOUT)
}

synchronie = async () => {
    console.log("Sync");
    await getTicketChanges();
}

getTicketChanges = async () => {
    let path = `/crm-objects/v1/change-log/tickets?hapikey=${CONFIG.HUBSPOT_APIKEY}`;
    path += (lastUpdateAt === null ? '' : `&timestamp=${lastUpdateAt}`);
    let changes = await doRequest({
        hostname: 'api.hubapi.com',
        path: path,
        method: 'GET'
    });

    if (changes.length == 0) return;

    //save the lastUpdatedAtValue
    lastUpdateAt = changes[changes.length - 1].timestamp;

    //map out the changed fields we are chekcing
    changes = changes.filter(change =>
        change.changes.changedProperties.some(property => trackedProperties.indexOf(property) >= 0)
    );

    if (changes.length == 0) return;

    //get only unique id (insert, update are emitted on insert from hubspot)
    const changedIds = changes.map(change => change.objectId);
    const uniqeChangedIds = Array.from(new Set(changedIds));

    //for each id emit a new event
    for (let i = 0; i < uniqeChangedIds.length; i++) {
        eventEmitter.emit("ticket-change", uniqeChangedIds[i]);
    }
}

eventEmitter.on('ticket-change', async (id) => {
    console.log("Got event on ticket updat", id);

    //get the data and upsert them to the mongo
})

module.exports.startSynchronization = startSynchronization;