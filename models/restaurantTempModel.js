const mongoose = require('mongoose');

const schema = mongoose.Schema;

const restaurantTempSchema = new schema({
    ownerID: {
        type: String,
        required: true
    },
    restaurantName: {
        type: String,
        required: true
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

const restaurantTempModel = mongoose.model('restaurantstemp',restaurantTempSchema,'restaurantstemp');

module.exports = restaurantTempModel;