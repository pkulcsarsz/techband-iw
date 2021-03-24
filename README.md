# Techband interview solution

Author: Peter Kulcsár Szabó

## Task
There is a high demand from our clients for Hubspot integration with our system. Your task is
to create a program that will synchronize contacts and tickets from Hubspot into our
database.

Clients would also be happy if the time delay between their updated contact/ticket in
Hubspot and its copy in our system would be as short as possible.
When creating your solution, do not forget that some of our clients have over 100 000
contacts/tickets in their Hubspot.

Our clients would like to sync these data from hubspot
- Contacts: first name, last name, all emails and phone numbers
- Tickets: ticket content and contact that ticket belongs to
  
You are free to choose your own programming language and database.

## Comments
### Codebase
- I have used EventEmmiter, in real world application i would recommend to use a MQ like Kafka, RabbitMQ or AWS SQS
- models folder contains schemas for mongodb
- services/synchronizer contains functions for synchronization of tickets and contacts
- services/requester contains a wrapper on https.request function to enable call it with await keyword (using built in https module over third party is on purpose)
- app.js is starting the app and listening for webhooks from hubspot
- there is a statistics job that periodicly writes out the current contacts and clients counts
### Tickets
- the first part is getting the changed tickets based on a timestamp and filtering out the changes where the tracked properties have changed
- the second part is getting the tickets and the tracked properties in batch and creates an array to update them in the database in paralell
### Contacts
- the first part is getting the last changes and then in memory is filtering out the already synced datas based on timestamp and then emitting event for each ticket separatly
- the second part is getting fired by the whole contact, so it upserts the model to the database