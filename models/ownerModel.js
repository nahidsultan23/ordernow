const mongoose = require('mongoose');

const schema = mongoose.Schema;

const ownerSchema = new schema({
    countryCodeFull: {
        type: String,
        required: true
    },
    countryCode: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique : true
    },
    email: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    photo: {
        type:String
    },
    name: {
        type: String,
        required: true
    },
    totalRestaurantCount: {
        type: Number,
        default: 0
    },
    currentRestaurantCount: {
        type: Number,
        default: 0
    },
    deletedRestaurantCount: {
        type: Number,
        default: 0
    }
});

const ownerModel = mongoose.model('owners',ownerSchema,'owners');

module.exports = ownerModel;