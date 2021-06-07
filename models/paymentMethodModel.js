const mongoose = require('mongoose');

const schema = mongoose.Schema;

const paymentMethodSchema = new schema({
    paymentMethod: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const paymentMethodModel = mongoose.model('paymentMethods',paymentMethodSchema,'paymentMethods');

module.exports = paymentMethodModel;