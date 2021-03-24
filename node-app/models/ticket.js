const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
});

module.exports = Ticket = mongoose.model('ticket', TicketSchema);