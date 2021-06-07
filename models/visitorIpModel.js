const mongoose = require('mongoose');

const schema = mongoose.Schema;

const visitorIpSchema = new schema({
    ip: {
        type: String,
        required: true
    },
    route: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const visitorIpModel = mongoose.model('visiting_ip_addresses',visitorIpSchema,'visiting_ip_addresses');

module.exports = visitorIpModel;