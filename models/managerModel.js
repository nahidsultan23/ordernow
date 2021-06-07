const mongoose = require('mongoose');

const schema = mongoose.Schema;

const managerSchema = new schema({
    restaurantID: {
        type: String,
        required: true
    },
    restaurantInitialUpdate: {
        type: Boolean,
        default: false
    },
    username: {
        type: String
    },
    name: {
        type: String,
        default: 'Mr. Manager'
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String
    },
    email: {
        type: String
    },
    isAssistant: {
        type: Boolean,
        default: false
    },
    photo: {
        type: String
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

const managerModel = mongoose.model('managers',managerSchema,'managers');

module.exports = managerModel;