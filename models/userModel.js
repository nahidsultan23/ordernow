const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userSchema = new schema({
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
    }
});

const userModel = mongoose.model('users',userSchema,'users');

module.exports = userModel;