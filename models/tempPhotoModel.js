const mongoose = require('mongoose');
const schema = mongoose.Schema;

const tempPhotoSchema = new schema({
    userID: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const tempPhotoModel = mongoose.model('temp_photo',tempPhotoSchema,'temp_photo');

module.exports = tempPhotoModel;