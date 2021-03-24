const CONFIG = require('../config');
const { EventEmitter } = require('events');
const { doRequest } = require('./requester');

const Contact = require('../models/contact');
const Ticket = require('../models/ticket');

const eventEmitter = new EventEmitter();

const trackedProperties = ["subject", "content"];

let lastSycncedAtTickets = null;
let lastSyncedAtContacts = null;
let isTicketsChangesFetchRunning = false;
let isContactsChangesFetchRunning = false;

startSynchronization = () => {
    setInterval(async () => {
        await synchronie();
    }, CONFIG.SYNC_TIMEOUT);

    setInterval(async () => {
        await getStatistics();
    }, CONFIG.STATS_TIMEOUT);
}

getStatistics = async() => {
    const contactsCount = await Contact.countDocuments();
    const ticketsCount = await Ticket.countDocuments();

    console.log(`There are ${contactsCount} contacts and ${ticketsCount} tickets in the database currently`);
}

synchronie = async () => {
    await getTicketChanges();
    await getContactChanges();
}

getTicketChanges = async () => {
    try {
        if (isTicketsChangesFetchRunning) return;

        isTicketsChangesFetchRunning = true; 

        let path = `/crm-objects/v1/change-log/tickets?hapikey=${CONFIG.HUBSPOT_APIKEY}`;
        path += (lastSycncedAtTickets === null ? '' : `&timestamp=${lastSycncedAtTickets}`);
        let changes = await doRequest({
            hostname: 'api.hubapi.com',
            path: path,
            method: 'GET'
        });
        isTicketsChangesFetchRunning = false;

        if (changes.length == 0) return;

        //save the lastUpdatedAtValue
        lastSycncedAtTickets = changes[changes.length - 1].timestamp;

        //map out the changed fields we are chekcing
        changes = changes.filter(change =>
            change.changes.changedProperties.some(property => trackedProperties.indexOf(property) >= 0)
        );

        if (changes.length == 0) return;

        //get only unique id (insert, update are emitted on insert from hubspot)
        const changedIds = changes.map(change => change.objectId);
        const uniqeChangedIds = Array.from(new Set(changedIds));
        
        eventEmitter.emit("tickets-change", uniqeChangedIds);        

    } catch (error) {
        isTicketsChangesFetchRunning = false;
        console.log(error);
    }
}

getContactChanges = async () => {
    try {
        if (isContactsChangesFetchRunning) return;

        isContactsChangesFetchRunning = true;
        let path = `/contacts/v1/lists/recently_updated/contacts/recent?hapikey=${CONFIG.HUBSPOT_APIKEY}&property=firstname&property=lastname&property=email&property=phone`;
        let changes = await doRequest({
            hostname: 'api.hubapi.com',
            path: path,
            method: 'GET'
        });
        isContactsChangesFetchRunning = false;

        if (changes.contacts.length == 0) return;

        //save the lastUpdatedAtValue
        changes = changes.contacts;

        //filter out that were synced
        changes = changes.filter(change => lastSyncedAtContacts == null || change.properties.lastmodifieddate.value > lastSyncedAtContacts);

        if (changes.length == 0) return;

        //update the last synced at value
        lastSyncedAtContacts = changes[0].properties.lastmodifieddate.value;

        let changedContacts = changes.map(change => {
            return {
                id: change.vid,
                firstname: change.properties?.firstname?.value,
                lastname: change.properties?.lastname?.value,
                phone: change.properties?.phone?.value,
                email: change['identity-profiles'][0]?.identities.filter(identity => identity.type == 'EMAIL').map(identity => identity.value).join(",")
            }
        });

        // for each id emit a new event
        for (let i = 0; i < changedContacts.length; i++) {
            eventEmitter.emit("contact-change", changedContacts[i]);
        }
    } catch (error) {
        isContactsChangesFetchRunning = false;
        console.log(error);
    }
}


eventEmitter.on('tickets-change', async (ids) => {
    let path = `/crm-objects/v1/objects/tickets/batch-read?hapikey=${CONFIG.HUBSPOT_APIKEY}&properties=subject&properties=content`;
    let tickets = await doRequest({
        hostname: 'api.hubapi.com',
        path: path,
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        }
    }, JSON.stringify({ids}));

    //then create promises
    tickets = ids.map(id => {
        return {
            subject: tickets[id].properties.subject?.value,
            content: tickets[id].properties.content?.value,
            createdby: tickets[id].properties['created_by']?.value,
            id: tickets[id].objectId
        }
    })

    let upsertPromises = [];
    for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        upsertPromises.push(Ticket.findOneAndUpdate({id: ticket.id}, ticket, {
            new: true,
            upsert: true 
          }))
    };

    await Promise.all(upsertPromises);
    //get the data and upsert them to the mongo
})

eventEmitter.on('contact-change', async (contact) => {
    //got the whole contact, so we can go and upsert it directly
    await Contact.findOneAndUpdate({id: contact.id}, contact, {
        new: true,
        upsert: true 
      });

})

module.exports.startSynchronization = startSynchronization;