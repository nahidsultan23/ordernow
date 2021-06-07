const mongoose = require('mongoose');

const schema = mongoose.Schema;

const sequenceSchema = new schema({
    seqNo: {
        type: Number,
        default: 0
    }
});

const sequenceModel = mongoose.model('sequence',sequenceSchema,'sequence');

module.exports = sequenceModel;