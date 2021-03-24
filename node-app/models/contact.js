const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    id: {
        type: Number,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    emails: {
        type: String,
        required: false
    },
    phonenumbers: {
        type: String,
        required: false
    },
});

module.exports = Contact = mongoose.model('contact', ContactSchema);