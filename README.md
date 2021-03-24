# Techband interview solution

Author: Peter Kulcsár Szabó

## Comments

### Codebase
- models folder contains schemas for mongodb
- services/synchronizer contains functions for synchronization of tickets
- services/requester contains a wrapper on https.request function to enable call it with await keyword (using built in https module over third party is on purpose)
- app.js is starting the app and listening for webhooks from hubspot

### Tickets
- I have used EventEmmiter, in real world application i would recommend to use a MQ like Kafka, RabbitMQ or AWS SQS


### Contacts
- I have used webhooks, this can minimize the gap between hubspot change and local change