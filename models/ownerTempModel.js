const mongoose = require('mongoose');

const schema = mongoose.Schema;

const ownerTempSchema = new schema({
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
    otp: {
        type: String,
        required: true
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    otpTrials: {
        type: Number,
        default: 0
    },
    lastOTPSendTime: {
        type: Date,
        default: Date.now
    }
});

const ownerTempModel = mongoose.model('ownerstemp',ownerTempSchema,'ownerstemp');

module.exports = ownerTempModel;