const mongoose = require('mongoose');
const schema = mongoose.Schema;

const pointSchema = new schema({
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number]
    }
});

module.exports = pointSchema;