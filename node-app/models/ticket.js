const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: false
    },
    subject: {
        type: String,
        required: true
    },
    createdby: {
        type: Number,
        required: false
    },
});

module.exports = Ticket = mongoose.model('ticket', TicketSchema);