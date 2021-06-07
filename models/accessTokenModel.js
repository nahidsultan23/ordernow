const mongoose = require('mongoose');

const schema = mongoose.Schema;

const accessTokenSchema = new schema({
    accessToken: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const accessTokenModel = mongoose.model('access_tokens',accessTokenSchema,'access_tokens');

module.exports = accessTokenModel;